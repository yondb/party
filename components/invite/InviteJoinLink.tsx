"use client";

import Link from "next/link";

type Props = {
  href: string;
  slotId: string;
  children: React.ReactNode;
  className?: string;
};

export function InviteJoinLink({ href, slotId, children, className }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        void fetch("/api/growth/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_name: "invite_cta_clicked", slot_id: slotId }),
        });
      }}
    >
      {children}
    </Link>
  );
}
