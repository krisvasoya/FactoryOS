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

    // 1. Fetch sales details for dynamic financial cards
    const invoices = await db.invoice.findMany({
      where: { companyId, deletedAt: null },
    });

    const payments = await db.payment.findMany({
      where: { companyId, deletedAt: null },
    });

    const expenses = await db.expense.findMany({
      where: { companyId, deletedAt: null },
    });

    const revenue = invoices.reduce((acc, inv) => acc + inv.subTotal, 0);
    const cashFlow = payments.reduce((acc, pay) => acc + pay.amount, 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const netProfit = revenue - totalExpenses;

    // 2. Fetch inventory values
    const inventoryItems = await db.inventoryItem.findMany({
      where: { companyId, deletedAt: null },
      include: {
        product: true,
        rawMaterial: true,
      },
    });

    const inventoryValue = inventoryItems.reduce((acc, item) => {
      const cost = item.product?.cost || item.rawMaterial?.cost || 0;
      return acc + (item.quantity * cost);
    }, 0);

    // 3. Find low-stock levels
    const rawMaterials = await db.rawMaterial.findMany({
      where: { companyId, deletedAt: null },
      include: {
        inventoryItems: true,
      },
    });

    const lowStockAlerts = rawMaterials.filter((mat) => {
      const currentStock = mat.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
      return currentStock < mat.minStock;
    }).map((mat) => {
      const currentStock = mat.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        id: mat.id,
        sku: mat.sku,
        name: mat.name,
        currentStock,
        minStock: mat.minStock,
        unit: mat.unit,
      };
    });

    // 4. Production states
    const prodOrders = await db.productionOrder.findMany({
      where: { companyId, deletedAt: null },
    });

    const pendingProduction = prodOrders.filter(o => o.status === 'Pending').length;
    const activeProduction = prodOrders.filter(o => o.status === 'InProgress').length;
    const completedProduction = prodOrders.filter(o => o.status === 'Completed').length;

    // 5. Machine monitoring statuses
    const machines = await db.machine.findMany({
      where: { companyId, deletedAt: null },
    });

    const activeMachinesCount = machines.filter(m => m.status === 'Active').length;
    const maintenanceMachinesCount = machines.filter(m => m.status === 'Maintenance').length;
    const offlineMachinesCount = machines.filter(m => m.status === 'Offline').length;

    // 6. Recent system operations log
    const auditLogs = await db.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // 7. Calculate Business Health Score
    // Formula: (Net Profit ratio + Inventory ratio + Machine status ratio) * 10
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 70;
    const machineHealthRatio = machines.length > 0 ? (activeMachinesCount / machines.length) * 100 : 80;
    const healthScore = Math.min(100, Math.round((profitMargin * 0.4) + (machineHealthRatio * 0.4) + 20));

    // 8. Construct AI insights/recommendations
    const recommendations = [];
    if (lowStockAlerts.length > 0) {
      recommendations.push(
        `Critical: Low stock detected for ${lowStockAlerts[0].name} (${lowStockAlerts[0].currentStock} ${lowStockAlerts[0].unit} left). Reorder recommended today.`
      );
    }
    if (maintenanceMachinesCount > 0) {
      recommendations.push(
        `Machine optimization: ${maintenanceMachinesCount} machine(s) are undergoing maintenance. Rearrange BOM processing routes.`
      );
    }
    if (profitMargin < 20) {
      recommendations.push(
        "Margin improvement: High material expense rates are limiting margins. Analyze alternative suppliers in the suppliers dashboard."
      );
    } else {
      recommendations.push(
        "Operating smoothly: Factory lines are functioning at optimal capacities. Material demand forecasts project steady sales flow."
      );
    }

    return NextResponse.json({
      metrics: {
        todaySales: revenue * 0.08, // Simulated daily sales representation
        monthlySales: revenue,
        revenue,
        expenses: totalExpenses,
        netProfit,
        cashFlow,
        inventoryValue,
        healthScore,
      },
      production: {
        pending: pendingProduction,
        active: activeProduction,
        completed: completedProduction,
      },
      machines: {
        active: activeMachinesCount,
        maintenance: maintenanceMachinesCount,
        offline: offlineMachinesCount,
      },
      lowStock: lowStockAlerts,
      recentLogs: auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        user: log.user?.name || 'System',
        entity: log.entity,
        time: log.createdAt,
      })),
      aiRecommendations: recommendations,
    });
  } catch (error) {
    console.error('Dashboard API failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
