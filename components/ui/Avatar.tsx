import Image from 'next/image';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: Size | number;
  level?: number;
  ringColor?: string;  // hex
  className?: string;
}

const sizeMap: Record<Size, { box: string; text: string; px: number; level: string }> = {
  xs: { box: 'size-6', text: 'text-[10px]', px: 24, level: 'size-3.5 text-[8px] -bottom-0 -right-0' },
  sm: { box: 'size-8', text: 'text-[11px]', px: 32, level: 'size-4 text-[9px] -bottom-0 -right-0' },
  md: { box: 'size-10', text: 'text-sm', px: 40, level: 'size-5 text-[10px] -bottom-0 -right-0' },
  lg: { box: 'size-14', text: 'text-lg', px: 56, level: 'size-6 text-xs -bottom-0 -right-0' },
  xl: { box: 'size-24', text: 'text-2xl', px: 96, level: 'size-7 text-sm -bottom-1 -right-1' },
  '2xl': { box: 'size-32', text: 'text-3xl', px: 128, level: 'size-9 text-base -bottom-1 -right-1' },
};

function initialsFrom(name?: string) {
  if (!name) return '?';
  const trimmed = name.trim();
  return trimmed.includes(' ')
    ? trimmed
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : trimmed.slice(0, 3).toUpperCase();
}

function resolveSize(size: Size | number | undefined): Size {
  if (size === undefined) return 'md';
  if (typeof size === 'string') return size;
  if (size >= 120) return '2xl';
  if (size >= 88) return 'xl';
  if (size >= 52) return 'lg';
  if (size >= 36) return 'md';
  if (size >= 28) return 'sm';
  return 'xs';
}

export function Avatar({ src, alt, name, size = 'md', level, ringColor, className }: AvatarProps) {
  const resolved = resolveSize(size);
  const cfg = sizeMap[resolved];

  const circle = (
    <div
      className={cn(
        cfg.box,
        'rounded-full overflow-hidden bg-gradient-to-br from-ash-200 to-ash-300 flex items-center justify-center',
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || 'avatar'}
          width={cfg.px}
          height={cfg.px}
          className="size-full object-cover"
        />
      ) : (
        <span className={cn('font-display font-semibold text-ash-700', cfg.text)}>
          {initialsFrom(name)}
        </span>
      )}
    </div>
  );

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {ringColor ? (
        <div className="rounded-full p-1" style={{ backgroundColor: ringColor }}>
          <div className="rounded-full bg-bg p-1">{circle}</div>
        </div>
      ) : (
        circle
      )}
      {level !== undefined && (
        <span
          className={cn(
            'absolute font-mono font-bold rounded-full bg-honey-500 text-graphite',
            'flex items-center justify-center border-2 border-bg',
            cfg.level,
          )}
        >
          {level}
        </span>
      )}
    </div>
  );
}
