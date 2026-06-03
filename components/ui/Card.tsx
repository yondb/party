import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  hero?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ interactive, hero, className, children, ...props }, ref) => {
    return (<div
        ref={ref}
        className={cn('bg-surface rounded-3xl border border-ash-200/40 shadow-sm',
          hero ? 'p-8' : 'p-6',
          interactive &&
            'cursor-pointer transition-all duration-200 ease-out-soft ' +
              'hover:shadow-md hover:-translate-y-0.5 hover:border-ash-200/80',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
