'use client';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, fullWidth, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium ' +
      'transition-all duration-150 ease-out-soft ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ' +
      'active:scale-[0.97]';

    const sizes: Record<Size, string> = {
      sm: 'h-9 px-3.5 text-body-sm rounded-2xl',
      md: 'h-11 px-5 text-body rounded-2xl',
      lg: 'h-14 px-7 text-body-lg rounded-full',
    };

    const variants: Record<Variant, string> = {
      primary:
        'bg-honey-500 text-graphite shadow-honey ' +
        'hover:bg-honey-400 hover:shadow-[0_12px_32px_-8px_rgba(245,184,0,0.55)]',
      dark:
        'bg-graphite text-surface shadow-md ' +
        'hover:bg-graphite-soft',
      secondary:
        'bg-surface text-ash-900 border border-ash-200 shadow-xs ' +
        'hover:bg-ash-50 hover:border-ash-300',
      ghost:
        'bg-transparent text-ash-700 ' +
        'hover:bg-ash-100 hover:text-ash-900',
      danger:
        'bg-danger text-surface shadow-md hover:bg-danger/90',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : icon ? (
          <span className="inline-flex shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
