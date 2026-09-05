import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wider transition-colors select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary border border-primary/40',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-muted text-muted-foreground border border-border',
        outline: 'text-foreground border border-border bg-transparent',
        success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        info: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
        purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
