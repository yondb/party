'use client';
import { CATEGORIES, type CategoryId, getCategory } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

interface Props {
  category: CategoryId;
  count: number;
  active?: boolean;
  joined?: boolean;
  onClick?: () => void;
}

export function MapMarker({ category, count, active, joined, onClick }: Props) {
  const cat = CATEGORIES[category] ?? getCategory(category);
  return (
    <button
      type="button"
      aria-label={`${cat.label}, ${count} osób`}
      className={cn(
        'relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer',
        'transition-all duration-200 ease-spring',
        'hover:scale-110 active:scale-95',
        active && 'scale-110 ring-2 ring-surface',
        joined && 'ring-2 ring-honey-500'
      )}
      style={{
        background: `linear-gradient(180deg, ${cat.color} 0%, ${cat.colorDark} 100%)`,
        boxShadow: `0 6px 14px -4px ${cat.color}88, 0 2px 4px -1px ${cat.colorDark}66`,
        pointerEvents: 'auto',
      } as CSSProperties}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick?.();
      }}
    >
      <span className="text-sm leading-none" aria-hidden>{cat.emoji}</span>
      <span className="font-mono text-[11px] font-bold text-white leading-none tabular-nums">
        {count}
      </span>
      <span
        aria-hidden
        className="absolute left-1/2 -bottom-[5px] -translate-x-1/2 size-0"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${cat.colorDark}`,
        }}
      />
    </button>
  );
}

export function MapClusterMarker({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Cluster of ${count} places`}
      className="size-12 rounded-full bg-graphite text-surface font-mono font-bold flex items-center justify-center shadow-md hover:scale-110 transition active:scale-95 cursor-pointer"
      style={{ pointerEvents: 'auto' }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick?.();
      }}
    >
      {count}
    </button>
  );
}

export function UserLocationMarker() {
  return (
    <div className="relative">
      <div className="size-4 rounded-full bg-honey-500 ring-4 ring-honey-500/30" />
      <div className="absolute inset-0 size-4 rounded-full bg-honey-500 animate-ping" />
    </div>
  );
}
