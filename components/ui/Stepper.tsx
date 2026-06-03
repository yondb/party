'use client';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function Stepper({ value, onChange, min = 1, max = 20, label }: StepperProps) {
  return (<div className="space-y-1.5">
      {label && <span className="block text-caption text-ash-500">{label}</span>}
      <div className="flex items-center justify-between h-14 px-2 bg-surface-2 border border-ash-200 rounded-2xl">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn('size-10 rounded-xl flex items-center justify-center text-ash-700',
            'hover:bg-ash-100 transition disabled:opacity-30 active:scale-95'
          )}
          aria-label="Decrease"
        >
          <Minus className="size-5" />
        </button>
        <span className="text-display-md font-mono text-honey-700 tabular-nums w-12 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn('size-10 rounded-xl flex items-center justify-center text-ash-700',
            'hover:bg-ash-100 transition disabled:opacity-30 active:scale-95'
          )}
          aria-label="Increase"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
}
