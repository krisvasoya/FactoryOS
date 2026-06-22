import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, checkRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;

    const employees = await db.employee.findMany({
      where: { companyId, deletedAt: null },
      include: {
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Employees fetch error:', error);
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

    if (action === 'createEmployee') {
      if (!checkRole(session.role, ['Owner', 'Admin', 'Manager'])) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { name, email, phone, department, role, salary } = body;

      if (!name || !department) {
        return NextResponse.json({ error: 'Name and Department are required' }, { status: 400 });
      }

      const employee = await db.employee.create({
        data: {
          companyId,
          name,
          email: email || null,
          phone: phone || null,
          department,
          role: role || null,
          salary: parseFloat(salary) || 0,
        },
      });

      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Create Employee',
          entity: 'Employee',
          entityId: employee.id,
          details: `Onboarded ${name} in ${department}`,
        },
      });

      return NextResponse.json(employee, { status: 201 });
    }

    if (action === 'markAttendance') {
      if (!checkRole(session.role, ['Owner', 'Admin', 'Manager', 'Production', 'Warehouse'])) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { employeeId, status, date: dateStr } = body;

      if (!employeeId || !status) {
        return NextResponse.json({ error: 'Missing attendance data' }, { status: 400 });
      }

      // Verify employee belongs to company
      const employee = await db.employee.findFirst({
        where: { id: employeeId, companyId, deletedAt: null },
      });
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }

      // Use provided date or today
      const targetDate = dateStr ? new Date(dateStr) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existing = await db.attendance.findFirst({
        where: { employeeId, date: { gte: targetDate, lte: dayEnd } },
      });

      if (existing) {
        const updated = await db.attendance.update({
          where: { id: existing.id },
          data: { status },
        });
        return NextResponse.json(updated);
      }

      const attendance = await db.attendance.create({
        data: {
          employeeId,
          date: targetDate,
          status,
          clockIn: status === 'Present' ? new Date() : null,
        },
      });

      return NextResponse.json(attendance, { status: 201 });
    }

    if (action === 'getEmployeeAttendance') {
      const { employeeId } = body;
      if (!employeeId) {
        return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
      }
      const employee = await db.employee.findFirst({
        where: { id: employeeId, companyId, deletedAt: null },
      });
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      const attendance = await db.attendance.findMany({
        where: { employeeId },
        orderBy: { date: 'desc' },
        take: 180,
      });
      return NextResponse.json({ employee, attendance });
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Employee operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
