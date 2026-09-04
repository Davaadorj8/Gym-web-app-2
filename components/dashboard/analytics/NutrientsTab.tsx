'use client';

import React, { useState } from 'react';
import { ShoppingCart, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { NutrientProduct, NutrientSaleLog } from '@/lib/types';
import { StatCard } from '../StatCard';
import { DataTable, Column } from '../DataTable';
import { formatCurrency, getNutrientExpiryStatus } from '@/lib/utils';

interface NutrientsTabProps {
  nutrients: NutrientProduct[];
  salesHistory: NutrientSaleLog[];
}

export function NutrientsTab({ nutrients, salesHistory }: NutrientsTabProps) {
  const [graphMetric, setGraphMetric] = useState<'volume' | 'valuation'>('volume');

  const totalStockVolume = nutrients.reduce((acc, n) => acc + n.stock, 0);
  const totalValuation = nutrients.reduce((acc, n) => acc + n.stock * n.price, 0);
  const totalSalesRevenue = salesHistory.reduce((acc, s) => acc + (s.totalPrice || 0), 0);

  const lowStockCount = nutrients.filter((n) => n.stock > 0 && n.stock <= 5).length;
  const outOfStockCount = nutrients.filter((n) => n.stock === 0).length;

  const chartData = nutrients.map((n) => ({
    name: n.name.length > 15 ? `${n.name.substring(0, 15)}...` : n.name,
    volume: n.stock,
    valuation: n.stock * n.price,
  }));

  const productColumns: Column<NutrientProduct>[] = [
    {
      key: 'name',
      header: 'Product Name',
      accessor: (n) => (
        <div>
          <span className="font-bold text-foreground">{n.name}</span>
          {n.flavor && <span className="block text-[10px] text-muted-foreground">{n.flavor}</span>}
        </div>
      ),
      sortable: true,
      sortValue: (n) => n.name,
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (n) => <span className="text-muted-foreground uppercase text-[10px]">{n.category}</span>,
      sortable: true,
      sortValue: (n) => n.category,
    },
    {
      key: 'price',
      header: 'Unit Price',
      accessor: (n) => <span className="text-[#D4FF00] font-bold">{formatCurrency(n.price)}</span>,
      sortable: true,
      sortValue: (n) => n.price,
    },
    {
      key: 'stock',
      header: 'Stock Status',
      accessor: (n) => (
        <span
          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
            n.stock === 0
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : n.stock <= 5
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {n.stock === 0 ? 'Out of Stock' : `${n.stock} in stock`}
        </span>
      ),
      sortable: true,
      sortValue: (n) => n.stock,
    },
    {
      key: 'expiry',
      header: 'Expiry Status',
      accessor: (n) => {
        const exp = getNutrientExpiryStatus(n.bestBeforeDate);
        return (
          <span
            className={`text-[10px] font-mono ${
              exp === 'expired'
                ? 'text-rose-400 font-bold'
                : exp === 'expiring_soon'
                ? 'text-amber-400'
                : 'text-muted-foreground'
            }`}
          >
            {exp === 'expired'
              ? 'Expired'
              : exp === 'expiring_soon'
              ? 'Expiring Soon'
              : exp === 'fresh'
              ? 'Fresh'
              : 'No Date'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-150">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Stock Inventory"
          value={`${totalStockVolume} units`}
          subtitle={`${nutrients.length} unique products listed`}
          icon={ShoppingCart}
          variant="default"
        />
        <StatCard
          title="Inventory Valuation"
          value={formatCurrency(totalValuation)}
          subtitle="Calculated at listed unit prices"
          icon={Sparkles}
          variant="success"
        />
        <StatCard
          title="Total Sales Revenue"
          value={formatCurrency(totalSalesRevenue)}
          subtitle={`${salesHistory.length} completed transactions`}
          icon={Sparkles}
          variant="info"
        />
        <StatCard
          title="Stock Alerts"
          value={`${lowStockCount + outOfStockCount} items`}
          subtitle={`${outOfStockCount} out of stock, ${lowStockCount} low stock`}
          icon={AlertTriangle}
          variant={outOfStockCount > 0 ? 'danger' : lowStockCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Switchable Graph */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Nutrient Inventory Distribution
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              {graphMetric === 'volume' ? 'Stock Volume per Product (Units)' : 'Stock Valuation per Product (₮)'}
            </p>
          </div>

          <div className="flex items-center bg-[#070D1E] border border-border/80 rounded-lg p-0.5 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setGraphMetric('volume')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                graphMetric === 'volume' ? 'bg-[#D4FF00] text-black font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Volume
            </button>
            <button
              type="button"
              onClick={() => setGraphMetric('valuation')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                graphMetric === 'valuation' ? 'bg-[#D4FF00] text-black font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Valuation
            </button>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070D1E', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar
                dataKey={graphMetric}
                fill={graphMetric === 'volume' ? '#38bdf8' : '#D4FF00'}
                radius={[4, 4, 0, 0]}
                name={graphMetric === 'volume' ? 'Stock Units' : 'Valuation (₮)'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Breakdown Table */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
          <Layers className="w-4 h-4 text-[#D4FF00]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            Product Stock Breakdown
          </h3>
        </div>

        <DataTable
          data={nutrients}
          columns={productColumns}
          keyExtractor={(n) => n.id}
          searchPlaceholder="Search nutrient items..."
          searchFilter={(n, q) =>
            Boolean(
              n.name.toLowerCase().includes(q.toLowerCase()) ||
              n.category.toLowerCase().includes(q.toLowerCase()) ||
              (n.flavor && n.flavor.toLowerCase().includes(q.toLowerCase()))
            )
          }
          emptyMessage="No nutrient items in stock."
        />
      </div>
    </div>
  );
}
