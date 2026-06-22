'use client';

import React from 'react';
import { Search, ArrowLeftRight } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { StockLevelsTable } from '@/features/inventory/components/StockLevelsTable';
import { MovementsTable } from '@/features/inventory/components/MovementsTable';
import { BarcodeGenerator } from '@/features/inventory/components/BarcodeGenerator';
import { StockActionModal } from '@/features/inventory/components/StockActionModal';

export default function InventoryPage() {
  const {
    data,
    loading,
    search,
    setSearch,
    showAdjustModal,
    setShowAdjustModal,
    activeTab,
    setActiveTab,
    catalogItems,
    filteredItems,
    error,
    form,
    handleAdjustment,
  } = useInventory();

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Warehouse inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track real-time stock levels, record warehouse transfers, and view material movements.
          </p>
        </div>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Post Stock Action</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('levels')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'levels'
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inventory Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'movements'
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Transaction Movement logs
          </button>
        </div>
        <div className="relative w-72 mb-2">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items, batch numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {activeTab === 'levels' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StockLevelsTable items={filteredItems || []} />
          </div>
          <div>
            <BarcodeGenerator />
          </div>
        </div>
      ) : (
        <MovementsTable movements={data?.movements || []} catalogItems={catalogItems} />
      )}

      {/* Adjust Modal */}
      {showAdjustModal && (
        <StockActionModal
          onClose={() => setShowAdjustModal(false)}
          onSubmit={handleAdjustment}
          error={error}
          warehouses={data?.warehouses || []}
          catalogItems={catalogItems}
          form={form}
        />
      )}
    </div>
  );
}
