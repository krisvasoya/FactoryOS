import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, ownerName, email, password } = body;

    if (!companyName || !ownerName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Check if email already registered
    const existingUser = await db.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        deletedAt: null,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create Company and Owner in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create Company
      const company = await tx.company.create({
        data: {
          name: companyName,
        },
      });

      // 2. Create Owner User
      const owner = await tx.user.create({
        data: {
          companyId: company.id,
          email: email.toLowerCase().trim(),
          passwordHash: passwordHash,
          name: ownerName,
          role: 'Owner',
        },
      });

      // 3. Create default Warehouses
      await tx.warehouse.create({
        data: {
          companyId: company.id,
          name: 'Central Warehouse',
          location: 'Main Unit',
        },
      });

      // 4. Create default Categories
      await tx.category.createMany({
        data: [
          { companyId: company.id, name: 'Raw Materials', description: 'Components and inputs' },
          { companyId: company.id, name: 'Finished Products', description: 'Ready for client shipments' },
        ],
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          companyId: company.id,
          userId: owner.id,
          action: 'Register Tenant',
          entity: 'Company',
          entityId: company.id,
          details: `Registered company ${companyName} and owner ${ownerName}`,
        },
      });

      return { company, owner };
    });

    // Generate JWT token
    const token = await createSessionToken({
      userId: result.owner.id,
      email: result.owner.email,
      name: result.owner.name,
      role: result.owner.role,
      companyId: result.company.id,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.owner.id,
        email: result.owner.email,
        name: result.owner.name,
        role: result.owner.role,
      },
      companyId: result.company.id,
    });

    // Set cookie
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
