'use client';

import { useState, useEffect } from 'react';

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  productId: string | null;
  rawMaterialId: string | null;
  quantity: number;
  batchNumber: string | null;
  warehouse: Warehouse;
  product?: { name: string; sku: string; type: string; unit: string } | null;
  rawMaterial?: { name: string; sku: string; minStock: number; unit: string } | null;
}

export interface StockMovement {
  id: string;
  productId: string | null;
  rawMaterialId: string | null;
  quantity: number;
  type: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  sourceWarehouse?: Warehouse | null;
  destWarehouse?: Warehouse | null;
}

export interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  kind: 'product' | 'material';
}

export function useInventory() {
  const [data, setData] = useState<{ warehouses: Warehouse[]; inventoryItems: InventoryItem[]; movements: StockMovement[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'levels' | 'movements'>('levels');

  // Form State
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState('Receive'); // Receive, Issue, Transfer
  const [itemId, setItemId] = useState(''); // combined SKU selector
  const [quantity, setQuantity] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Catalog selectors
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  async function loadInventory() {
    try {
      const res = await fetch('/api/v1/inventory');
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
        if (payload.warehouses.length > 0) {
          setWarehouseId(payload.warehouses[0].id);
          setDestWarehouseId(payload.warehouses[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectors() {
    try {
      const [prodsRes, matsRes] = await Promise.all([
        fetch('/api/v1/products'),
        fetch('/api/v1/raw-materials'),
      ]);
      if (prodsRes.ok && matsRes.ok) {
        const prods = await prodsRes.json();
        const mats = await matsRes.json();
        const combined = [
          ...prods.map((p: { id: string; name: string; sku: string }) => ({ id: p.id, name: p.name, sku: p.sku, kind: 'product' as const })),
          ...mats.map((m: { id: string; name: string; sku: string }) => ({ id: m.id, name: m.name, sku: m.sku, kind: 'material' as const })),
        ];
        setCatalogItems(combined);
        if (combined.length > 0) setItemId(combined[0].id + '|' + combined[0].kind);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadInventory();
    loadSelectors();
  }, []);

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const [realId, kind] = itemId.split('|');
    const payload = {
      warehouseId,
      productId: kind === 'product' ? realId : undefined,
      rawMaterialId: kind === 'material' ? realId : undefined,
      quantity,
      type,
      destWarehouseId: type === 'Transfer' ? destWarehouseId : undefined,
      batchNumber,
      notes,
    };

    try {
      const res = await fetch('/api/v1/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAdjustModal(false);
        setQuantity('');
        setBatchNumber('');
        setNotes('');
        loadInventory();
      } else {
        const payloadErr = await res.json();
        setError(payloadErr.error || 'Failed to complete transaction.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const filteredItems = data?.inventoryItems.filter((item) => {
    const name = item.product?.name || item.rawMaterial?.name || '';
    const sku = item.product?.sku || item.rawMaterial?.sku || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.batchNumber && item.batchNumber.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return {
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
    setError,
    form: {
      warehouseId,
      setWarehouseId,
      type,
      setType,
      itemId,
      setItemId,
      quantity,
      setQuantity,
      destWarehouseId,
      setDestWarehouseId,
      batchNumber,
      setBatchNumber,
      notes,
      setNotes,
    },
    handleAdjustment,
    loadInventory,
  };
}
