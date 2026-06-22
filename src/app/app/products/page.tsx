'use client';

import React from 'react';
import { Plus, Search } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductTable } from '@/features/products/components/ProductTable';
import { AddProductModal } from '@/features/products/components/AddProductModal';

export default function ProductsPage() {
  const {
    filtered,
    loading,
    search,
    setSearch,
    showModal,
    setShowModal,
    error,
    form,
    handleAddProduct,
  } = useProducts();

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Finished Goods catalog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage finished and semi-finished product catalog codes, pricing details, and manufacturing values.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Control panel */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by SKU, item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <ProductTable products={filtered} />

      {/* Add Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddProduct}
          error={error}
          form={form}
        />
      )}
    </div>
  );
}
