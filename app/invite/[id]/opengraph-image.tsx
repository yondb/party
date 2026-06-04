import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { activityLabel } from "@/lib/i18n-ui";

export const runtime = "edge";
export const alt = "lfparty invite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: slot } = await supabase
    .from("slots")
    .select("title, activity_type, location_name, date_time")
    .eq("id", id)
    .maybeSingle();

  const title = slot?.title ?? "Join a meetup";
  const activity = slot ? activityLabel(slot.activity_type) : "lfparty";
  const when = slot
    ? new Date(slot.date_time).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const place = slot?.location_name ?? "Austin, TX";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)",
          color: "#fafaf9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#F5B800", fontWeight: 700 }}>lfparty</div>
        <div style={{ fontSize: 56, fontWeight: 800, marginTop: 24, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 20, opacity: 0.9 }}>
          {activity} · {when}
        </div>
        <div style={{ fontSize: 28, marginTop: 12, opacity: 0.75 }}>📍 {place}</div>
      </div>
    ),
    { ...size },
  );
}
