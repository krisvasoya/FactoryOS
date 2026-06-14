import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePasswords, createSessionToken, setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth';

// GET /api/v1/auth - Fetch active user session information
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user details & company details
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: {
          select: {
            id: true,
            name: true,
            gstNumber: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      companyId: user.company.id,
      companyName: user.company.name,
    });
  } catch (error) {
    console.error('Session retrieve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/auth - Sign-in endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordMatch = await comparePasswords(password, user.passwordHash);
    if (!passwordMatch) {
      // Create audit log for failed attempt
      await db.auditLog.create({
        data: {
          companyId: user.companyId,
          userId: user.id,
          action: 'Failed Login',
          entity: 'User',
          entityId: user.id,
          details: 'Failed password verification',
        },
      });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    });

    // Write audit log
    await db.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: 'Login',
        entity: 'User',
        entityId: user.id,
        details: 'Successful user authentication',
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set cookie
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/auth - Logout endpoint
export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  const response = NextResponse.json({ success: true });
  
  if (session) {
    // Write audit log
    await db.auditLog.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        action: 'Logout',
        entity: 'User',
        entityId: session.userId,
        details: 'User logged out',
      },
    });
  }

  clearSessionCookie(response);
  return response;
}
