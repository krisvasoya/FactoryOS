'use client';

import { useState, useEffect } from 'react';

export interface DashboardData {
  metrics: {
    todaySales: number;
    monthlySales: number;
    revenue: number;
    expenses: number;
    netProfit: number;
    cashFlow: number;
    inventoryValue: number;
    healthScore: number;
  };
  production: {
    pending: number;
    active: number;
    completed: number;
  };
  machines: {
    active: number;
    maintenance: number;
    offline: number;
  };
  lowStock: Array<{
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minStock: number;
    unit: string;
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    user: string;
    entity: string;
    time: string;
    timeAgo?: string;
  }>;
  aiRecommendations: string[];
  financialData: Array<{ name: string; Revenue: number; Expenses: number }>;
  productionData: Array<{ name: string; Target: number; Completed: number }>;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboardData() {
    try {
      const res = await fetch('/api/v1/dashboard');
      if (res.ok) {
        const payload = await res.json();
        
        const now = Date.now();
        const processedLogs = (payload.recentLogs || []).map((log: { id: string; action: string; user: string; entity: string; time: string }) => {
          const diff = now - new Date(log.time).getTime();
          const mins = Math.floor(diff / 60000);
          const hrs = Math.floor(mins / 60);
          const days = Math.floor(hrs / 24);

          let timeAgo = '';
          if (mins < 1) timeAgo = 'Just now';
          else if (mins < 60) timeAgo = `${mins} min ago`;
          else if (hrs < 24) timeAgo = `${hrs} hr ago`;
          else timeAgo = `${days} days ago`;

          return { ...log, timeAgo };
        });

        setData({ ...payload, recentLogs: processedLogs });
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatLogTitle = (action: string, entity: string) => {
    if (action === 'Create' && entity === 'ProductionOrder') return 'New production order created';
    if (action === 'Update' && entity === 'Invoice') return 'Invoice status updated';
    if (action === 'Create' && entity === 'Invoice') return 'New invoice issued';
    if (action === 'Create' && entity === 'Payment') return 'Payment recorded';
    if (action === 'Create' && entity === 'Expense') return 'New expense logged';
    if (action === 'Create' && entity === 'RawMaterial') return 'New raw material added';
    if (action === 'Create' && entity === 'Product') return 'New finished product added';
    if (action === 'Update' && entity === 'Machine') return 'Machine status modified';
    return `${action} action on ${entity}`;
  };

  // Metrics Calculations
  let revenueChangeText = '0.0% vs last month';
  let revenuePositive: boolean | 'neutral' = 'neutral';
  if (data?.financialData && data.financialData.length >= 2) {
    const currentRev = data.financialData[data.financialData.length - 1].Revenue;
    const prevRev = data.financialData[data.financialData.length - 2].Revenue;
    if (prevRev > 0) {
      const changeVal = ((currentRev - prevRev) / prevRev) * 100;
      if (changeVal > 0) {
        revenueChangeText = `+${changeVal.toFixed(1)}% vs last month`;
        revenuePositive = true;
      } else if (changeVal < 0) {
        revenueChangeText = `${changeVal.toFixed(1)}% vs last month`;
        revenuePositive = false;
      } else {
        revenueChangeText = '0.0% vs last month';
        revenuePositive = 'neutral';
      }
    } else if (currentRev > 0) {
      revenueChangeText = '+100.0% vs last month';
      revenuePositive = true;
    }
  }

  let profitChangeText = '0.0% vs last month';
  let profitPositive: boolean | 'neutral' = 'neutral';
  if (data?.financialData && data.financialData.length >= 2) {
    const currentRev = data.financialData[data.financialData.length - 1].Revenue;
    const currentExp = data.financialData[data.financialData.length - 1].Expenses;
    const prevRev = data.financialData[data.financialData.length - 2].Revenue;
    const prevExp = data.financialData[data.financialData.length - 2].Expenses;
    const currentProfit = currentRev - currentExp;
    const prevProfit = prevRev - prevExp;
    if (prevProfit !== 0) {
      const changeVal = ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100;
      if (changeVal > 0) {
        profitChangeText = `+${changeVal.toFixed(1)}% vs last month`;
        profitPositive = true;
      } else if (changeVal < 0) {
        profitChangeText = `${changeVal.toFixed(1)}% vs last month`;
        profitPositive = false;
      } else {
        profitChangeText = '0.0% vs last month';
        profitPositive = 'neutral';
      }
    } else if (currentProfit !== 0) {
      profitChangeText = currentProfit > 0 ? '+100.0% vs last month' : '-100.0% vs last month';
      profitPositive = currentProfit > 0;
    }
  }

  let ordersChangeText = '0.0% vs last week';
  let ordersPositive: boolean | 'neutral' = 'neutral';
  if (data?.productionData && data.productionData.length >= 2) {
    const currentOrders = data.productionData[data.productionData.length - 1].Target;
    const prevOrders = data.productionData[data.productionData.length - 2].Target;
    if (prevOrders > 0) {
      const changeVal = ((currentOrders - prevOrders) / prevOrders) * 100;
      if (changeVal > 0) {
        ordersChangeText = `+${changeVal.toFixed(1)}% vs last week`;
        ordersPositive = true;
      } else if (changeVal < 0) {
        ordersChangeText = `${changeVal.toFixed(1)}% vs last week`;
        ordersPositive = false;
      } else {
        ordersChangeText = '0.0% vs last week';
        ordersPositive = 'neutral';
      }
    } else if (currentOrders > 0) {
      ordersChangeText = '+100.0% vs last week';
      ordersPositive = true;
    }
  }

  let pendingChangeText = '0.0% vs last week';
  let pendingPositive: boolean | 'neutral' = 'neutral';
  if (data?.productionData && data.productionData.length >= 2) {
    const currentOrders = data.productionData[data.productionData.length - 1].Target;
    const currentCompleted = data.productionData[data.productionData.length - 1].Completed;
    const prevOrders = data.productionData[data.productionData.length - 2].Target;
    const prevCompleted = data.productionData[data.productionData.length - 2].Completed;
    const currentPending = Math.max(0, currentOrders - currentCompleted);
    const prevPending = Math.max(0, prevOrders - prevCompleted);
    if (prevPending > 0) {
      const changeVal = ((currentPending - prevPending) / prevPending) * 100;
      if (changeVal > 0) {
        pendingChangeText = `+${changeVal.toFixed(1)}% vs last week`;
        pendingPositive = false;
      } else if (changeVal < 0) {
        pendingChangeText = `${changeVal.toFixed(1)}% vs last week`;
        pendingPositive = true;
      } else {
        pendingChangeText = '0.0% vs last week';
        pendingPositive = 'neutral';
      }
    } else if (currentPending > 0) {
      pendingChangeText = '+100.0% vs last week';
      pendingPositive = false;
    }
  }

  return {
    data,
    loading,
    refreshing,
    handleRefresh,
    loadDashboardData,
    formatLogTitle,
    computedChanges: {
      revenueChangeText,
      revenuePositive,
      profitChangeText,
      profitPositive,
      ordersChangeText,
      ordersPositive,
      pendingChangeText,
      pendingPositive,
    },
  };
}
