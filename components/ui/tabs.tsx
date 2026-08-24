'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TabsListProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
  variant?: 'pill' | 'underline' | 'boxed';
  id?: string;
}

export function TabsList<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'boxed',
  id = 'tabs-navigation',
}: TabsListProps<T>) {
  if (variant === 'boxed') {
    return (
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(val) => onTabChange(val as T)}
      >
        <TabsPrimitive.List
          id={id}
          className={cn(
            'flex items-center gap-1 bg-card border border-border p-1 rounded-xl',
            className
          )}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <TabsPrimitive.Trigger
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                value={tab.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
                  isActive
                    ? 'bg-muted text-primary border border-border shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                )}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 text-[10px] font-mono rounded font-bold',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted/80 text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </TabsPrimitive.Root>
    );
  }

  return (
    <TabsPrimitive.Root
      value={activeTab}
      onValueChange={(val) => onTabChange(val as T)}
    >
      <TabsPrimitive.List
        id={id}
        className={cn('flex items-center gap-2 overflow-x-auto pb-1', className)}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TabsPrimitive.Trigger
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              value={tab.id}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted'
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-mono rounded font-bold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
