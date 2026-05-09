"use client";

import Pusher from "pusher-js";

let instance: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;
  if (!instance) {
    instance = new Pusher(key, {
      cluster,
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });
  }
  return instance;
}
