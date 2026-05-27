import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'honey' | 'success' | 'danger' | 'slash';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variants: Record<Variant, string> = {
    default: 'bg-ash-100 text-ash-700',
    honey: 'bg-honey-50 text-honey-700',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    slash: 'bg-transparent text-ash-500 font-mono lowercase normal-case tracking-normal',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === 'slash' && '/'}
      {children}
    </span>
  );
}
