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

    // Fetch Machines
    const machines = await db.machine.findMany({
      where: { companyId, deletedAt: null },
      include: {
        maintenanceLogs: {
          orderBy: { scheduledAt: 'desc' },
        },
      },
    });

    return NextResponse.json(machines);
  } catch (error) {
    console.error('Machines retrieval failed:', error);
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

    if (action === 'createMaintenance') {
      const { machineId, description, cost, scheduledAt } = body;

      if (!machineId || !description || !scheduledAt) {
        return NextResponse.json({ error: 'Missing details for maintenance schedule' }, { status: 400 });
      }

      // Verify machine belongs to company
      const machine = await db.machine.findFirst({
        where: { id: machineId, companyId, deletedAt: null }
      });
      if (!machine) {
        return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
      }

      const log = await db.maintenanceLog.create({
        data: {
          machineId,
          description,
          cost: parseFloat(cost) || 0.0,
          scheduledAt: new Date(scheduledAt),
        },
      });

      // Update machine status
      await db.machine.update({
        where: { id: machineId },
        data: { status: 'Maintenance' },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Schedule Maintenance',
          entity: 'Machine',
          entityId: machineId,
          details: `Scheduled checkup: ${description}`,
        },
      });

      return NextResponse.json(log, { status: 201 });
    }

    if (action === 'completeMaintenance') {
      const { logId, machineId, notes } = body;

      if (!logId || !machineId) {
        return NextResponse.json({ error: 'Missing completion IDs' }, { status: 400 });
      }

      // Verify machine belongs to company
      const machine = await db.machine.findFirst({
        where: { id: machineId, companyId, deletedAt: null }
      });
      if (!machine) {
        return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
      }

      // Verify maintenance log exists for this machine
      const logExists = await db.maintenanceLog.findFirst({
        where: { id: logId, machineId: machine.id, deletedAt: null }
      });
      if (!logExists) {
        return NextResponse.json({ error: 'Maintenance log not found for this machine' }, { status: 404 });
      }

      const log = await db.$transaction(async (tx) => {
        const updatedLog = await tx.maintenanceLog.update({
          where: { id: logId },
          data: {
            completedAt: new Date(),
            notes,
          },
        });

        // Set machine status back to active and reset running hours if major overhaul
        await tx.machine.update({
          where: { id: machineId },
          data: {
            status: 'Active',
            lastMaintenance: new Date(),
          },
        });

        return updatedLog;
      });

      return NextResponse.json(log);
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Machine operation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
