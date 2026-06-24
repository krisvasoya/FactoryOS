'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Check, ShieldAlert, Package, Layers } from 'lucide-react';
import { MatchedItem } from '../hooks/useDocumentIntelligence';

interface ProductMatchSelectorProps {
  item: MatchedItem;
  onClose: () => void;
  onSelect: (selected: { id: string; name: string; type: 'rawMaterial' | 'product' }) => void;
}

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  type: 'rawMaterial' | 'product';
}

interface APIItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
}

export function ProductMatchSelector({
  item,
  onClose,
  onSelect,
}: ProductMatchSelectorProps) {
  // Suggested alternatives from OCR response
  const alternatives = item.match?.alternatives || [];
  const hasAlternatives = alternatives.length > 0;

  const [activeTab, setActiveTab] = useState<'alternatives' | 'search'>(
    hasAlternatives ? 'alternatives' : 'search'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load products & raw materials from database
  useEffect(() => {
    if (activeTab === 'search' && catalog.length === 0) {
      const fetchCatalog = async () => {
        setIsLoading(true);
        setError('');
        try {
          const [rmRes, prodRes] = await Promise.all([
            fetch('/api/v1/raw-materials'),
            fetch('/api/v1/products'),
          ]);

          if (!rmRes.ok || !prodRes.ok) {
            throw new Error('Failed to load catalog database');
          }

          const rawMaterials = (await rmRes.json()) as APIItem[];
          const products = (await prodRes.json()) as APIItem[];

          const normalizedCatalog: CatalogItem[] = [
            ...rawMaterials.map((r) => ({
              id: r.id,
              name: r.name,
              sku: r.sku,
              unit: r.unit,
              type: 'rawMaterial' as const,
            })),
            ...products.map((p) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              unit: p.unit,
              type: 'product' as const,
            })),
          ];

          setCatalog(normalizedCatalog);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error fetching database items');
        } finally {
          setIsLoading(false);
        }
      };

      void fetchCatalog();
    }
  }, [activeTab, catalog.length]);

  // Derived state: Filter catalog based on search query dynamically during render
  const filteredCatalog = searchQuery.trim() === ''
    ? catalog
    : catalog.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/10">
          <div>
            <h3 className="text-sm font-bold text-foreground">Resolve Product Match</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select correct mapping for: <span className="text-sky-400 font-semibold">&ldquo;{item.productName}&rdquo;</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Header */}
        {hasAlternatives && (
          <div className="flex border-b border-border px-6 py-2 bg-secondary/5 gap-4">
            <button
              onClick={() => setActiveTab('alternatives')}
              className={`pb-2 pt-1 text-xs font-bold transition-all border-b-2 relative bottom-[-9px] ${
                activeTab === 'alternatives'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              AI Suggestions
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-2 pt-1 text-xs font-bold transition-all border-b-2 relative bottom-[-9px] ${
                activeTab === 'search'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Search Database
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'alternatives' && hasAlternatives && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-sky-500/5 border border-sky-500/10 rounded-xl px-4 py-2.5">
                <Layers className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Gemini matched similar products based on abbreviations, names, and HSN codes.</span>
              </div>

              <div className="space-y-2">
                {alternatives.map((alt) => {
                  const confPct = Math.round(alt.confidence * 100);
                  const confColor =
                    alt.confidence >= 0.85
                      ? 'bg-emerald-500'
                      : alt.confidence >= 0.6
                      ? 'bg-amber-500'
                      : 'bg-red-500';

                  return (
                    <button
                      key={alt.id}
                      onClick={() => onSelect({ id: alt.id, name: alt.name, type: alt.type })}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card/30 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-left group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground group-hover:text-sky-400 transition-colors">
                            {alt.name}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-secondary/50 text-muted-foreground border border-border">
                            {alt.type === 'rawMaterial' ? 'Raw Material' : 'Product'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                              <div
                                className={`h-full ${confColor}`}
                                style={{ width: `${confPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {confPct}% match
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Check className="h-4 w-4 text-sky-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search catalog by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {isLoading ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Loading database catalog...</p>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/15 border border-red-500/20 text-xs text-red-400">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching database items found
                </div>
              ) : (
                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                  {filteredCatalog.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelect({ id: c.id, name: c.name, type: c.type })}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/20 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-left group"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-sky-400 transition-colors">
                          {c.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            SKU: {c.sku}
                          </span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-[10px] text-muted-foreground">
                            Unit: {c.unit}
                          </span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/80">
                            {c.type === 'rawMaterial' ? 'Raw Material' : 'Product'}
                          </span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Check className="h-4 w-4 text-sky-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t border-border bg-secondary/10">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Can&apos;t find it? Close this and create a new catalog item.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary/40 text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
