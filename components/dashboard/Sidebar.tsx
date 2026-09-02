'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAppLocale } from '@/components/I18nProvider';
import {
  Zap,
  UserCheck,
  KeyRound,
  UserPlus,
  Users,
  BarChart3,
  Package,
  ShieldCheck,
  LogOut,
  Globe,
  ArrowLeftRight,
  PanelLeftClose,
  PanelLeftOpen,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onLogout: propOnLogout,
  onCheckInClick,
  currentUser: propCurrentUser,
  onSwitchRole: propOnSwitchRole,
  isCollapsed: propIsCollapsed,
  onToggleCollapse: propOnToggleCollapse,
}: SidebarProps) {
  const dashboard = useDashboard();
  const activeTab = propActiveTab ?? dashboard.activeTab;
  const setActiveTab = propSetActiveTab ?? dashboard.setActiveTab;
  const onLogout = propOnLogout ?? dashboard.logout;
  const currentUser = propCurrentUser ?? dashboard.currentUser;
  const onSwitchRole = propOnSwitchRole ?? dashboard.switchRole;
  const isCollapsed = propIsCollapsed ?? dashboard.sidebarCollapsed;
  const onToggleCollapse = propOnToggleCollapse ?? dashboard.toggleSidebar;

  const t = useTranslations('Sidebar');
  const { locale, setLocale } = useAppLocale();

  const menuItems = [
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
    if (item.id === 'approvals' || item.id === 'inventory') {
      return isAdmin;
    }
    return hasStaffPermission(currentUser, item.id);
  });

  return (
    <aside
      id="sidebar-container"
      className={cn(
        'bg-background border-r border-border flex flex-col justify-between shrink-0 min-h-dvh text-muted-foreground select-none z-20 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[76px]' : 'w-[clamp(13rem,16vw,17rem)]'
      )}
    >
      {/* Top Header & Navigation */}
      <div className={cn('flex flex-col gap-4', isCollapsed ? 'p-3' : 'p-4 sm:p-5')}>
        {/* Brand Header & Toggle */}
        <div
          id="sidebar-brand"
          className={cn(
            'flex items-center justify-between',
            isCollapsed ? 'flex-col gap-3 px-0' : 'px-1'
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              id="sidebar-logo"
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0"
              title="Arche.fitness"
            >
              <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="text-foreground font-extrabold text-base tracking-tight leading-tight truncate">
                  Arche.fitness
                </span>
                <span className="text-[9px] font-bold tracking-[0.18em] text-muted-foreground uppercase font-mono leading-tight truncate">
                  {t('brandManagement')}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
            aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center shrink-0',
              isCollapsed && 'w-8 h-8'
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-primary" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Check In Member Button */}
        {hasStaffPermission(currentUser, 'checkin') && (
          <button
            id="btn-check-in-member"
            type="button"
            onClick={onCheckInClick || (() => setActiveTab('checkin-desk'))}
            title={t('checkInMember')}
            className={cn(
              'bg-primary hover:opacity-90 active:scale-[0.99] text-primary-foreground font-extrabold rounded-xl flex items-center shadow-lg shadow-primary/20 transition-all cursor-pointer',
              isCollapsed
                ? 'w-10 h-10 mx-auto justify-center p-0'
                : 'w-full text-xs py-3 px-4 justify-center gap-2'
            )}
          >
            <UserCheck className="w-4 h-4 text-primary-foreground stroke-[2.5] shrink-0" />
            {!isCollapsed && <span className="truncate">{t('checkInMember')}</span>}
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
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                  isCollapsed
                    ? 'w-10 h-10 mx-auto justify-center p-0'
                    : 'w-full min-h-[2.5rem] gap-3 px-3 py-2 text-left',
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
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Language switcher & User Info */}
      <div className="flex flex-col border-t border-border bg-card">
        {/* Language selector in sidebar */}
        <div
          className={cn(
            'flex items-center border-b border-border/60',
            isCollapsed ? 'p-2 justify-center' : 'px-4 py-2.5 justify-between'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono uppercase">{t('language')}</span>
            </div>
          )}
          <div className="flex bg-background border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setLocale(locale === 'mn' ? 'en' : 'mn')}
              title={t('language')}
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold rounded font-mono transition-all cursor-pointer',
                isCollapsed
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hidden'
              )}
            >
              {locale.toUpperCase()}
            </button>
            {!isCollapsed && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* User profile info & role switcher */}
        <div
          id="sidebar-user-footer"
          className={cn('flex flex-col gap-2.5', isCollapsed ? 'p-2.5 items-center' : 'p-4 sm:p-5')}
        >
          <div
            className={cn(
              'flex items-center',
              isCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2.5 overflow-hidden',
                isCollapsed && 'justify-center'
              )}
            >
              <div
                id="user-avatar-badge"
                title={`${currentUser?.name || (isAdmin ? 'Admin' : 'Staff')} (${isAdmin ? t('admin') : t('staff')})`}
                className={cn(
                  'w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0',
                  isAdmin
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-primary'
                    : 'bg-sky-950/40 border-sky-500/50 text-sky-400'
                )}
              >
                {isAdmin ? 'AD' : 'ST'}
              </div>
              {!isCollapsed && (
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
              )}
            </div>

            <button
              id="btn-logout"
              type="button"
              onClick={onLogout}
              title={t('signOut')}
              className={cn(
                'text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0',
                isCollapsed ? 'p-1.5' : 'p-2'
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Role Switcher */}
          {onSwitchRole && (
            <div
              className={cn(
                'flex items-center bg-background border border-border rounded-lg p-1',
                isCollapsed ? 'flex-col gap-1 w-full' : 'justify-between'
              )}
            >
              {!isCollapsed ? (
                <>
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
                </>
              ) : (
                <button
                  id="btn-switch-role-toggle"
                  type="button"
                  onClick={() => onSwitchRole(isAdmin ? 'staff' : 'admin')}
                  title={`Switch to ${isAdmin ? 'Staff' : 'Admin'}`}
                  className={cn(
                    'w-full py-0.5 text-[9px] font-mono font-bold rounded text-center transition-all cursor-pointer',
                    isAdmin ? 'text-primary' : 'text-sky-400'
                  )}
                >
                  {isAdmin ? 'AD' : 'ST'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
