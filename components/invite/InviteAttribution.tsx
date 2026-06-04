"use client";

import { useEffect } from "react";
import {
  REF_SLOT_COOKIE,
  UTM_CAMPAIGN_COOKIE,
  UTM_MEDIUM_COOKIE,
  UTM_SOURCE_COOKIE,
  cookieMaxAgeSec,
  parseAttributionFromSearchParams,
} from "@/lib/growth/attribution";

function setCookie(name: string, value: string) {
  const maxAge = cookieMaxAgeSec();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

type Props = {
  slotId: string;
};

/** Persist ref_slot + UTM from invite URL for signup attribution. */
export function InviteAttribution({ slotId }: Props) {
  useEffect(() => {
    setCookie(REF_SLOT_COOKIE, slotId);
    const params = new URLSearchParams(window.location.search);
    const attr = parseAttributionFromSearchParams(params);
    if (attr.utm_source) setCookie(UTM_SOURCE_COOKIE, attr.utm_source);
    if (attr.utm_medium) setCookie(UTM_MEDIUM_COOKIE, attr.utm_medium);
    if (attr.utm_campaign) setCookie(UTM_CAMPAIGN_COOKIE, attr.utm_campaign);

    void fetch("/api/growth/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "invite_viewed",
        slot_id: slotId,
        properties: {
          utm_source: attr.utm_source ?? null,
          utm_medium: attr.utm_medium ?? null,
          utm_campaign: attr.utm_campaign ?? null,
        },
      }),
    });
  }, [slotId]);

  return null;
}
