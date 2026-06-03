'use client';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  emoji?: string;
  icon?: React.ReactNode;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(({ active, emoji, icon, className, children, ...props }, ref) => {
    return (<button
        ref={ref}
        className={cn('inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-body-sm font-medium',
          'transition-all duration-150 ease-out-soft whitespace-nowrap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          active
            ? 'bg-graphite text-surface shadow-sm'
            : 'bg-surface text-ash-700 border border-ash-200/60 hover:bg-ash-50 hover:border-ash-300',
          className
        )}
        {...props}
      >
        {emoji && <span className="text-base leading-none">{emoji}</span>}
        {icon && <span className="size-4 shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);
Chip.displayName = 'Chip';
