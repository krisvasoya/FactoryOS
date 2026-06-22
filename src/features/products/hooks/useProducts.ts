'use client';

import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  unit: string;
  type: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [type, setType] = useState('Finished');

  async function loadProducts() {
    try {
      const res = await fetch('/api/v1/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sku, description, price, cost, unit, type }),
      });

      if (res.ok) {
        setShowModal(false);
        // Reset form
        setName('');
        setSku('');
        setDescription('');
        setPrice('');
        setCost('');
        loadProducts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create product.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return {
    products,
    filtered,
    loading,
    search,
    setSearch,
    showModal,
    setShowModal,
    error,
    setError,
    form: {
      name,
      setName,
      sku,
      setSku,
      description,
      setDescription,
      price,
      setPrice,
      cost,
      setCost,
      unit,
      setUnit,
      type,
      setType,
    },
    handleAddProduct,
    loadProducts,
  };
}
