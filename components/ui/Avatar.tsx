"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, name, size = 40, className = "" }: AvatarProps) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={`rounded-full border-2 border-[var(--border-strong)] object-cover ${className}`}
        unoptimized={src.includes("supabase.co")}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-[var(--border-medium)] bg-[var(--bg-surface-2)] font-semibold text-[var(--accent)] ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
