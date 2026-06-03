import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';

interface AvatarStackProps {
  avatars: Array<{ src?: string | null; name?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function AvatarStack({ avatars, max = 3, size = 'sm', className }: AvatarStackProps) {
  const shown = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const ringClass = 'ring-2 ring-bg';
  const boxClass = size === 'xs' ? 'size-6' : size === 'sm' ? 'size-8' : 'size-10';
  const overflowText = size === 'xs' ? 'text-[10px]' : 'text-[11px]';

  return (<div className={cn('flex items-center', className)}>
      {shown.map((a, i) => (<div key={i} className={cn(ringClass, 'rounded-full', i > 0 && '-ml-2')}>
          <Avatar src={a.src} name={a.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (<div className={cn(boxClass, '-ml-2 rounded-full bg-ash-200 text-ash-700 flex items-center justify-center font-mono font-semibold', ringClass, overflowText)}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
