'use client';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function FAB() {
  return (
    <Link
      href="/slots/new"
      aria-label="Stwórz nowy slot"
      className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 size-14 lg:size-16 rounded-full bg-honey-500 text-graphite shadow-honey flex items-center justify-center hover:bg-honey-400 hover:scale-105 active:scale-95 transition-all duration-200 ease-spring"
    >
      <Plus className="size-7" strokeWidth={2.4} />
    </Link>
  );
}
