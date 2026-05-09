"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { slotChannelName } from "@/lib/realtime-channels";
import { sendSlotMessage } from "@/app/actions/messages";
import { Button } from "@/components/ui/Button";

type Msg = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

export function SlotChat({
  slotId,
  title,
  initial,
  currentUserId,
}: {
  slotId: string;
  title: string;
  initial: Msg[];
  currentUserId: string;
}) {
  const [items, setItems] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const channelName = useMemo(() => slotChannelName(slotId), [slotId]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const ch = pusher.subscribe(channelName);
    const handler = (payload: Msg) => {
      setItems((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
    };
    ch.bind("new-message", handler);
    return () => {
      ch.unbind("new-message", handler);
      pusher.unsubscribe(channelName);
    };
  }, [channelName]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setLoading(true);
    try {
      const res = await sendSlotMessage(slotId, t);
      if (!res.error && res.message) {
        setItems((prev) => [...prev, res.message as Msg]);
        setText("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <div className="border-b border-[var(--gold-dim)] bg-[var(--bg-panel)] px-3 py-3">
        <h1 className="font-display text-lg text-[var(--gold-bright)]">{title}</h1>
        <p className="text-xs text-[var(--text-muted)]">Czat party</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto py-3">
        {items.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)]">Brak wiadomości — zacznij rozmowę.</p>
        ) : (
          items.map((m) => {
            const own = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    own
                      ? "border border-[var(--gold-dark)] bg-[linear-gradient(180deg,#2a2210,#1a1510)] text-[var(--text-bright)]"
                      : "border border-[var(--gold-dim)] bg-[var(--bg-input)] text-[var(--text-primary)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottom} />
      </div>
      <form onSubmit={onSend} className="flex gap-2 border-t border-[var(--gold-dim)] bg-[var(--bg-void)] py-2">
        <input
          className="input-wow flex-1"
          placeholder="Napisz wiadomość…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" variant="primary" className="!px-4" disabled={loading}>
          Wyślij
        </Button>
      </form>
    </div>
  );
}
