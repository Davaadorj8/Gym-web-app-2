'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAppLocale } from '@/components/I18nProvider';
import {
  Zap,
  UserCheck,
  LayoutGrid,
  KeyRound,
  UserPlus,
  Users,
  BarChart3,
  Package,
  ShieldCheck,
  LogOut,
  Globe,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthUser, UserRole } from '@/lib/types';
import { useDashboard } from '@/lib/orchestration';
import { hasStaffPermission } from '@/lib/services';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onLogout?: () => void;
  onCheckInClick?: () => void;
  currentUser?: AuthUser;
  onSwitchRole?: (role: UserRole) => void;
}

export default function Sidebar({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onLogout: propOnLogout,
  onCheckInClick,
  currentUser: propCurrentUser,
  onSwitchRole: propOnSwitchRole,
}: SidebarProps) {
  const dashboard = useDashboard();
  const activeTab = propActiveTab ?? dashboard.activeTab;
  const setActiveTab = propSetActiveTab ?? dashboard.setActiveTab;
  const onLogout = propOnLogout ?? dashboard.logout;
  const currentUser = propCurrentUser ?? dashboard.currentUser;
  const onSwitchRole = propOnSwitchRole ?? dashboard.switchRole;

  const t = useTranslations('Sidebar');
  const { locale, setLocale } = useAppLocale();

  const menuItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutGrid },
    { id: 'checkin-desk', label: t('navCheckInDesk'), icon: UserCheck },
    { id: 'locker', label: t('navLockerUsage'), icon: KeyRound },
    { id: 'registration', label: t('navRegistration'), icon: UserPlus },
    { id: 'directory', label: t('navMemberDirectory'), icon: Users },
    { id: 'analytics', label: t('navAnalytics'), icon: BarChart3 },
    { id: 'inventory', label: t('navInventory'), icon: Package },
    { id: 'approvals', label: t('navStaffApprovals'), icon: ShieldCheck },
  ];

  const isAdmin = currentUser?.role === 'admin';

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.id === 'approvals') {
      return isAdmin;
    }
    return hasStaffPermission(currentUser, item.id);
  });

  return (
    <aside
      id="sidebar-container"
      className="w-64 bg-background border-r border-border flex flex-col justify-between shrink-0 min-h-screen text-muted-foreground select-none z-20"
    >
      {/* Top Header & Navigation */}
      <div className="p-4 sm:p-5 flex flex-col gap-5">
        {/* Brand Header */}
        <div id="sidebar-brand" className="flex items-center gap-3 px-1">
          <div
            id="sidebar-logo"
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0"
          >
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-extrabold text-base tracking-tight leading-tight">
              Arche.fitness
            </span>
            <span className="text-[9px] font-bold tracking-[0.18em] text-muted-foreground uppercase font-mono leading-tight">
              {t('brandManagement')}
            </span>
          </div>
        </div>

        {/* Check In Member Button */}
        {hasStaffPermission(currentUser, 'checkin') && (
          <button
            id="btn-check-in-member"
            type="button"
            onClick={onCheckInClick || (() => setActiveTab('checkin-desk'))}
            className="w-full bg-primary hover:opacity-90 active:scale-[0.99] text-primary-foreground font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-primary-foreground stroke-[2.5]" />
            <span>{t('checkInMember')}</span>
          </button>
        )}

        {/* Navigation List */}
        <nav id="sidebar-nav-menu" className="flex flex-col gap-1 mt-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left',
                  isActive
                    ? 'bg-muted text-primary border border-border shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Language switcher & User Info */}
      <div className="flex flex-col border-t border-border bg-card">
        {/* Language selector in sidebar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/60">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono uppercase">{t('language')}</span>
          </div>
          <div className="flex bg-background border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setLocale('mn')}
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold rounded font-mono transition-all cursor-pointer',
                locale === 'mn'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              MN
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold rounded font-mono transition-all cursor-pointer',
                locale === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              EN
            </button>
          </div>
        </div>

        {/* User profile info & role switcher */}
        <div
          id="sidebar-user-footer"
          className="p-3.5 flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                id="user-avatar-badge"
                className={cn(
                  'w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0',
                  isAdmin
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-primary'
                    : 'bg-sky-950/40 border-sky-500/50 text-sky-400'
                )}
              >
                {isAdmin ? 'AD' : 'ST'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground truncate leading-tight">
                  {currentUser?.name || (isAdmin ? 'Admin' : 'Staff')}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      isAdmin ? 'bg-primary' : 'bg-sky-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold uppercase tracking-wider',
                      isAdmin ? 'text-primary' : 'text-sky-400'
                    )}
                  >
                    {isAdmin ? t('admin') : t('staff')}
                  </span>
                </div>
              </div>
            </div>

            <button
              id="btn-logout"
              type="button"
              onClick={onLogout}
              title={t('signOut')}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Role Switcher */}
          {onSwitchRole && (
            <div className="flex items-center justify-between bg-background border border-border rounded-lg p-1">
              <span className="text-[9px] font-mono text-muted-foreground pl-1.5 flex items-center gap-1">
                <ArrowLeftRight className="w-2.5 h-2.5" />
                <span>{t('role')}</span>
              </span>
              <div className="flex gap-1">
                <button
                  id="btn-switch-role-admin"
                  type="button"
                  onClick={() => onSwitchRole('admin')}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer',
                    isAdmin
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('admin')}
                </button>
                <button
                  id="btn-switch-role-staff"
                  type="button"
                  onClick={() => onSwitchRole('staff')}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer',
                    !isAdmin
                      ? 'bg-sky-400 text-black shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('staff')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
