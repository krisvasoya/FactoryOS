import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;

    // Fetch Company Details
    const company = await db.company.findUnique({
      where: { id: companyId },
    });

    // Fetch all users in company
    const members = await db.user.findMany({
      where: { companyId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json({ company, members });
  } catch (error) {
    console.error('Settings GET failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;
    const body = await req.json();
    const { action } = body;

    // Reject non-Owners/Admins from executing modifications
    if (session.role !== 'Owner' && session.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden. Owner or Admin permissions required.' }, { status: 403 });
    }

    if (action === 'updateCompany') {
      const { name, phone, address, gstNumber } = body;

      if (!name) {
        return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
      }

      const company = await db.company.update({
        where: { id: companyId },
        data: {
          name,
          phone,
          address,
          gstNumber,
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Update Settings',
          entity: 'Company',
          entityId: companyId,
          details: `Updated company metadata: ${name}`,
        },
      });

      return NextResponse.json(company);
    }

    if (action === 'inviteUser') {
      const { name, email, role, password } = body;

      if (!name || !email || !role || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      // Password strength: minimum 8 characters (mirrors registration policy)
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
      }

      // Role sanity check — prevent arbitrary role injection
      const allowedRoles = ['Admin', 'Manager', 'Accountant', 'Production', 'Warehouse', 'Sales', 'Viewer'];
      if (!allowedRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
      }

      const existingUser = await db.user.findFirst({
        where: { email: email.toLowerCase().trim(), deletedAt: null },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      const passwordHash = await hashPassword(password);

      const user = await db.user.create({
        data: {
          companyId,
          email: email.toLowerCase().trim(),
          passwordHash,
          name,
          role,
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Invite User',
          entity: 'User',
          entityId: user.id,
          details: `Created user ${name} with role ${role}`,
        },
      });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Settings POST failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
