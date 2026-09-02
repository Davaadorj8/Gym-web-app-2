const fs = require('fs');
let content = fs.readFileSync('components/dashboard/InventoryView.tsx', 'utf8');

const startIdx = content.indexOf('{/* 4. SUPPLIERS & PURCHASE ORDERS TAB */}');
const endIdx = content.indexOf('{/* Nutrient Creation Modal */}');

if (startIdx !== -1 && endIdx !== -1) {
  let jsxPart = content.substring(startIdx, endIdx);
  
  let cleanJsx = jsxPart.replace(/\{activeTab === 'purchase-orders' && \(/, "");

  const lastBracket = cleanJsx.lastIndexOf(')}');
  if (lastBracket !== -1) {
    cleanJsx = cleanJsx.substring(0, lastBracket);
  }

  const newTab = `
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Badge } from '@/components/ui';
import { 
  Building2, Plus, Phone, FileText, ShoppingCart, 
  MapPin, Check, Truck, X, Package, Clock, ChevronDown, ChevronUp, UserCheck
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDashboard } from '@/lib/orchestration';
import { Supplier, PurchaseOrder } from '@/lib/types';

interface SuppliersAndPOTabProps {
  showToast: (msg: string) => void;
}

export function SuppliersAndPOTab({ showToast }: SuppliersAndPOTabProps) {
  const t = useTranslations('Inventory');
  const dashboard = useDashboard();
  
  const suppliers = dashboard.suppliers || [];
  const purchaseOrders = dashboard.purchaseOrders || [];
  
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    email: '',
  });

  const handleRegisterSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierForm.name.trim() || !newSupplierForm.phone.trim()) return;

    dashboard.addSupplier({
      name: newSupplierForm.name,
      contactPerson: newSupplierForm.contactPerson || undefined,
      phone: newSupplierForm.phone,
      address: newSupplierForm.address || undefined,
      email: newSupplierForm.email || undefined,
    });
    
    showToast('New nutrient supplier registered.');
    setNewSupplierForm({ name: '', contactPerson: '', phone: '', address: '', email: '' });
  };

  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'ordered': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'received': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      ${cleanJsx}
    </div>
  );
}
`;

  fs.writeFileSync('components/dashboard/inventory/SuppliersAndPOTab.tsx', newTab);
}
