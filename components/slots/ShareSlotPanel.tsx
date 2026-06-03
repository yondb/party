'use client';

import { useCallback, useState } from 'react';
import { Share2, Copy, Check, Sparkles } from 'lucide-react';
import { growthUi } from '@/lib/i18n-ui';
import { cn } from '@/lib/utils';
type Props = {
  slotId: string;
};

export function ShareSlotPanel({ slotId }: Props) {
  const t = growthUi();
  const [text, setText] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCopy = useCallback(async (): Promise<{ text: string; url: string | null } | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/growth/share-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      const data = (await res.json()) as {
        text?: string;
        url?: string;
        aiGenerated?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t.loadError);
        return null;
      }
      const nextText = data.text ?? '';
      const nextUrl = data.url ?? null;
      setText(nextText);
      setUrl(nextUrl);
      setAiGenerated(Boolean(data.aiGenerated));
      return { text: nextText, url: nextUrl };
    } catch {
      setError(t.loadError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [slotId, t.loadError]);

  async function copyToClipboard() {
    let copyText = text;
    if (!copyText) {
      const loaded = await loadCopy();
      copyText = loaded?.text ?? null;
    }
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t.copyError);
    }
  }

  async function nativeShare() {
    let shareText = text;
    let shareUrl = url;
    if (!shareText) {
      const loaded = await loadCopy();
      if (!loaded) return;
      shareText = loaded.text;
      shareUrl = loaded.url;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'lfparty',
          text: shareText,
          url: shareUrl ?? undefined,
        });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    await copyToClipboard();
  }

  return (<section className="rounded-2xl border border-honey-200/80 bg-honey-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-heading-md text-ash-900">
            <Share2 className="size-4 text-honey-700" />
            {t.shareTitle}
          </h2>
          <p className="mt-1 text-body-sm text-ash-600">{t.shareHint}</p>
        </div>
        {aiGenerated ? (<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-caption font-medium text-honey-800">
            <Sparkles className="size-3" />
            AI
          </span>
        ) : null}
      </div>

      {text ? (<p className="mt-3 whitespace-pre-wrap rounded-xl border border-ash-200/60 bg-surface p-3 text-body-sm text-ash-800">
          {text}
        </p>
      ) : null}

      {error ? <p className="mt-2 text-body-sm text-danger">{error}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void nativeShare()}
          disabled={loading}
          className="inline-flex h-10 min-w-[8rem] flex-1 items-center justify-center gap-2 rounded-2xl bg-graphite px-4 text-body-sm font-medium text-surface transition hover:bg-graphite-soft disabled:opacity-50"
        >
          <Share2 className="size-4" />
          {loading ? t.loading : t.shareButton}
        </button>
        <button
          type="button"
          onClick={() => void copyToClipboard()}
          disabled={loading}
          className={cn('inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-ash-200 bg-surface px-4 text-body-sm font-medium text-ash-800 transition hover:bg-ash-50 disabled:opacity-50',
            copied && 'border-success text-success',
          )}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? t.copied : t.copy}
        </button>
        {!text && !loading ? (<button
            type="button"
            onClick={() => void loadCopy()}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-ash-200 px-4 text-body-sm font-medium text-ash-700 hover:bg-ash-50"
          >
            {t.prepare}
          </button>
        ) : null}
      </div>
    </section>
  );
}
