import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;

    // Get or create mapping Employee profile
    let employee = await db.employee.findFirst({
      where: { companyId, email: session.email, deletedAt: null },
    });

    if (!employee) {
      employee = await db.employee.create({
        data: {
          companyId,
          name: session.name,
          email: session.email,
          department: 'Admin',
          role: session.role || 'Supervisor',
          salary: 0,
        },
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const attendanceToday = await db.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: startOfToday },
      },
    });

    const startOfHistory = new Date();
    startOfHistory.setDate(startOfHistory.getDate() - 30);
    startOfHistory.setHours(0, 0, 0, 0);

    const history = await db.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startOfHistory },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      employee,
      attendanceToday,
      history,
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
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
    const body = await req.json().catch(() => ({}));
    const { action, coords } = body;

    let employee = await db.employee.findFirst({
      where: { companyId, email: session.email, deletedAt: null },
    });

    if (!employee) {
      employee = await db.employee.create({
        data: {
          companyId,
          name: session.name,
          email: session.email,
          department: 'Admin',
          role: session.role || 'Supervisor',
          salary: 0,
        },
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingAttendance = await db.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: startOfToday },
      },
    });

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (action === 'clockIn') {
      if (existingAttendance) {
        return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 });
      }

      // Check if late (after 9:30 AM local server time)
      const now = new Date();
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
      const status = isLate ? 'Late' : 'Present';

      const attendance = await db.attendance.create({
        data: {
          employeeId: employee.id,
          date: new Date(),
          status,
          clockIn: new Date(),
        },
      });

      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Clock In',
          entity: 'Attendance',
          entityId: attendance.id,
          details: JSON.stringify({ ipAddress, coords }),
          ipAddress,
        },
      });

      return NextResponse.json(attendance, { status: 201 });
    }

    if (action === 'clockOut') {
      if (!existingAttendance) {
        return NextResponse.json({ error: 'No active clock-in session found for today' }, { status: 400 });
      }

      if (existingAttendance.clockOut) {
        return NextResponse.json({ error: 'Already clocked out today' }, { status: 400 });
      }

      const attendance = await db.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          clockOut: new Date(),
        },
      });

      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Clock Out',
          entity: 'Attendance',
          entityId: attendance.id,
          details: JSON.stringify({ ipAddress, coords }),
          ipAddress,
        },
      });

      return NextResponse.json(attendance);
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
