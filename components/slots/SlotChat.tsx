"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher-client";
import { slotChannelName } from "@/lib/realtime-channels";
import { sendSlotMessage } from "@/app/actions/messages";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { Lang } from "@/lib/i18n-lang";
import { pageHeaderUi, slotChatUi } from "@/lib/i18n-ui";

type Msg = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

type SenderInfo = { name: string; avatar_url: string | null };

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function dayDividerLabel(iso: string, lang: Lang) {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "pl" ? "pl-PL" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function timeLabel(iso: string, lang: Lang) {
  return new Date(iso).toLocaleTimeString(lang === "pl" ? "pl-PL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SlotChat({
  slotId,
  hostId,
  title,
  initial,
  currentUserId,
  senderMap: initialSenderMap,
}: {
  slotId: string;
  hostId: string;
  title: string;
  initial: Msg[];
  currentUserId: string;
  senderMap: Record<string, SenderInfo>;
}) {
  const { lang } = useLanguage();
  const back = pageHeaderUi(lang);
  const ui = slotChatUi(lang);
  const [items, setItems] = useState<Msg[]>(initial);
  const [senderMap, setSenderMap] = useState<Record<string, SenderInfo>>(initialSenderMap);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const channelRef = useRef<{ trigger?: (event: string, data: object) => boolean } | null>(null);
  const typingHideRef = useRef<number | null>(null);
  const typingEmitRef = useRef<number | null>(null);

  const channelName = useMemo(() => slotChannelName(slotId), [slotId]);

  const emitTyping = useCallback(() => {
    const ch = channelRef.current;
    if (!ch?.trigger) return;
    try {
      ch.trigger("client-typing", { sender_id: currentUserId });
    } catch {
      // Client events must be enabled for the Pusher app key.
    }
  }, [currentUserId]);

  const scheduleTypingEmit = useCallback(() => {
    if (typingEmitRef.current) window.clearTimeout(typingEmitRef.current);
    typingEmitRef.current = window.setTimeout(() => {
      emitTyping();
    }, 200);
  }, [emitTyping]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const ch = pusher.subscribe(channelName);
    channelRef.current = ch as { trigger?: (event: string, data: object) => boolean };
    const handler = (payload: Msg) => {
      setItems((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
      setSenderMap((prev) => {
        if (prev[payload.sender_id]) return prev;
        return {
          ...prev,
          [payload.sender_id]: { name: "…", avatar_url: null },
        };
      });
    };
    const onClientTyping = (data: { sender_id?: string }) => {
      if (!data.sender_id || data.sender_id === currentUserId) return;
      setOtherTyping(true);
      if (typingHideRef.current) window.clearTimeout(typingHideRef.current);
      typingHideRef.current = window.setTimeout(() => setOtherTyping(false), 2200);
    };
    ch.bind("new-message", handler);
    ch.bind("client-typing", onClientTyping);
    return () => {
      ch.unbind("new-message", handler);
      ch.unbind("client-typing", onClientTyping);
      pusher.unsubscribe(channelName);
      channelRef.current = null;
      if (typingHideRef.current) window.clearTimeout(typingHideRef.current);
      if (typingEmitRef.current) window.clearTimeout(typingEmitRef.current);
    };
  }, [channelName, currentUserId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setSendError(null);
    setLoading(true);
    try {
      const res = await sendSlotMessage(slotId, t);
      if (res.error) {
        setSendError(res.error);
        return;
      }
      if (res.message) {
        setItems((prev) => [...prev, res.message as Msg]);
        setText("");
      }
    } finally {
      setLoading(false);
    }
  }

  const focusRing =
    "outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-void)]";

  return (
    <div className="flex min-h-0 flex-col">
      <PageHeader
        title={title}
        subtitle={ui.subtitle}
        backHref={`/slots/${slotId}`}
        backLabel={back.back}
        right={
          <Link
            href={`/profile/${hostId}`}
            className={`${focusRing} shrink-0 rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] px-2 py-2 font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--gold-mid)] hover:border-[var(--gold-mid)] hover:text-[var(--gold-bright)] sm:px-3 sm:text-xs`}
          >
            {ui.hostProfile}
          </Link>
        }
      />
      <div className="flex min-h-[min(520px,calc(100dvh-14rem))] flex-col rounded-lg border border-[var(--gold-dim)] bg-[var(--bg-panel)]/40">
        <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3 sm:px-3">
          {otherTyping ? (
            <p className="text-center text-xs italic text-[var(--gold-mid)]">{ui.typing}</p>
          ) : null}
          {items.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-muted)]">{ui.empty}</p>
          ) : (
            items.map((m, i) => {
              const own = m.sender_id === currentUserId;
              const prev = i > 0 ? items[i - 1] : null;
              const showDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
              const who = senderMap[m.sender_id] ?? { name: "?", avatar_url: null };
              return (
                <Fragment key={m.id}>
                  {showDay ? (
                    <div className="flex justify-center py-1">
                      <span className="rounded-full border border-[var(--gold-dim)] bg-[var(--bg-input)] px-3 py-1 font-display text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        {dayDividerLabel(m.created_at, lang)}
                      </span>
                    </div>
                  ) : null}
                  <div className={`flex gap-2 ${own ? "flex-row-reverse" : "flex-row"}`}>
                    {!own ? (
                      <Link href={`/profile/${m.sender_id}`} className={`${focusRing} shrink-0 rounded-full`}>
                        <Avatar src={who.avatar_url} name={who.name} size={36} />
                      </Link>
                    ) : (
                      <div className="w-9 shrink-0" aria-hidden />
                    )}
                    <div className={`min-w-0 max-w-[85%] ${own ? "items-end" : "items-start"} flex flex-col`}>
                      {!own ? (
                        <span className="mb-0.5 text-xs text-[var(--text-muted)]">{who.name}</span>
                      ) : null}
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          own
                            ? "border border-[var(--gold-dark)] bg-[linear-gradient(180deg,#2a2210,#1a1510)] text-[var(--text-bright)]"
                            : "border border-[var(--gold-dim)] bg-[var(--bg-input)] text-[var(--text-primary)]"
                        }`}
                      >
                        {m.content}
                      </div>
                      <time
                        className="mt-1 text-[10px] text-[var(--text-muted)]"
                        dateTime={m.created_at}
                        title={new Date(m.created_at).toISOString()}
                      >
                        {timeLabel(m.created_at, lang)}
                      </time>
                    </div>
                  </div>
                </Fragment>
              );
            })
          )}
          <div ref={bottom} />
        </div>
        <form
          onSubmit={onSend}
          className={`flex gap-2 border-t border-[var(--gold-dim)] bg-[var(--bg-void)]/90 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] sm:px-3`}
        >
          <input
            className={`input-wow flex-1 ${focusRing}`}
            placeholder={ui.placeholder}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              scheduleTypingEmit();
            }}
            autoComplete="off"
          />
          <Button type="submit" variant="primary" className="!px-4" disabled={loading}>
            {loading ? ui.sending : ui.send}
          </Button>
        </form>
        {sendError ? (
          <p className="border-t border-[var(--status-full)]/40 bg-[var(--status-full)]/10 px-3 py-2 text-center text-sm text-[var(--status-full)]">
            {ui.sendFailed}
            <span className="mt-1 block font-mono text-xs opacity-80">{sendError}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
