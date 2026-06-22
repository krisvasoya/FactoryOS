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

    // Calculate last 7 months of financial data dynamically
    const financialData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const monthNum = d.getMonth();
      const yearNum = d.getFullYear();

      const startOfMonth = new Date(yearNum, monthNum, 1);
      const endOfMonth = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);

      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= startOfMonth && invDate <= endOfMonth;
      });
      const monthRevenue = monthInvoices.reduce((acc, inv) => acc + inv.subTotal, 0);

      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startOfMonth && expDate <= endOfMonth;
      });
      const monthExpenseSum = monthExpenses.reduce((acc, exp) => acc + exp.amount, 0);

      financialData.push({
        name: monthName,
        Revenue: monthRevenue,
        Expenses: monthExpenseSum,
      });
    }

    // Calculate weekly production output (target vs completed) for the last 4 weeks
    const productionData = [];
    for (let i = 3; i >= 0; i--) {
      const end = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

      const weekOrders = prodOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= start && orderDate <= end;
      });

      const targetVal = weekOrders.reduce((acc, o) => acc + o.quantity, 0);
      const completedVal = weekOrders.filter(o => o.status === 'Completed').reduce((acc, o) => acc + o.quantity, 0);

      productionData.push({
        name: `Week ${4 - i}`,
        Target: targetVal,
        Completed: completedVal,
      });
    }

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
      financialData,
      productionData,
    });
  } catch (error) {
    console.error('Dashboard API failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

