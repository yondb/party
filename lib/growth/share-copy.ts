import { buildSlotShareUrl } from "@/lib/growth/share-url";
import { activityLabel } from "@/lib/i18n-ui";
import { MARKET_CITY_LABEL } from "@/lib/market";

export type SlotShareInput = {
  id: string;
  title: string;
  location_name: string;
  date_time: string;
  activity_type: string;
  max_spots: number;
  spots_taken: number;
};

export type ShareCopyResult = {
  text: string;
  url: string;
  aiGenerated: boolean;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function templateShareCopy(slot: SlotShareInput): string {
  const url = buildSlotShareUrl(slot.id);
  const when = formatWhen(slot.date_time);
  const activity = activityLabel(slot.activity_type);
  const guestCap = Math.max(1, slot.max_spots - 1);
  const open = Math.max(0, guestCap - slot.spots_taken);

  return open > 0
    ? `${activity} · ${slot.title}\n📍 ${slot.location_name} · ${when}\n👋 ${open} spots left — join:\n${url}`
    : `${activity} · ${slot.title}\n📍 ${slot.location_name} · ${when}\nSee on lfparty:\n${url}`;
}

async function aiShareCopy(slot: SlotShareInput): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const when = formatWhen(slot.date_time);
  const activity = activityLabel(slot.activity_type);
  const url = buildSlotShareUrl(slot.id);
  const guestCap = Math.max(1, slot.max_spots - 1);
  const open = Math.max(0, guestCap - slot.spots_taken);

  const system = `Write short outdoor meetup invites in ${MARKET_CITY_LABEL} (lfparty). Max 280 chars. No spam hashtags. End with the exact link provided.`;
  const user = `Activity: ${activity}\nTitle: ${slot.title}\nPlace: ${slot.location_name}\nWhen: ${when}\nOpen spots: ${open}\nLink: ${url}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 200,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text || !text.includes(url)) return null;
    return text.slice(0, 400);
  } catch {
    return null;
  }
}

export async function generateSlotShareCopy(slot: SlotShareInput): Promise<ShareCopyResult> {
  const url = buildSlotShareUrl(slot.id);
  const ai = await aiShareCopy(slot);
  if (ai) {
    return { text: ai, url, aiGenerated: true };
  }
  return { text: templateShareCopy(slot), url, aiGenerated: false };
}
