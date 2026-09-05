'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { useDashboard } from '@/lib/orchestration';
import { useAppLocale } from '@/components/I18nProvider';

export default function BranchSwitcherWidget() {
  const { locations, selectedLocationId, setSelectedLocationId, currentUser } = useDashboard();
  const { locale } = useAppLocale();

  const isStaff = currentUser?.role === 'staff';
  const activeLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <div id="branch-switcher-widget" className="flex items-center gap-2.5 bg-slate-900/90 rounded-lg p-1.5 px-3 border border-white/10 text-xs sm:text-sm">
      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Building2 className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {locale === 'mn' ? 'Салбар' : 'Branch Location'}
          </span>
          {isStaff ? (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {locale === 'mn' ? 'Заагдсан салбар' : 'Assigned Location'}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {locale === 'mn' ? 'Байгууллага' : 'Organization-Wide'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {isStaff ? (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
              <span>{activeLocation ? activeLocation.name : (locale === 'mn' ? 'Downtown Flagship' : 'Downtown Flagship')}</span>
              {activeLocation && (
                <span className="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {activeLocation.code}
                </span>
              )}
            </div>
          ) : (
            <select
              id="branch-location-select"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-white cursor-pointer focus:outline-none hover:text-primary transition-colors pr-2"
            >
              <option value="all" className="bg-slate-900 text-slate-100 font-medium">
                🌐 {locale === 'mn' ? 'Бүх салбарууд (Нэгтгэсэн)' : 'All Locations (Aggregated)'}
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-100 font-medium">
                  📍 {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
