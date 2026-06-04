/** Cookie keys for viral attribution (30 days). */
export const REF_SLOT_COOKIE = "pf_ref_slot";
export const UTM_SOURCE_COOKIE = "pf_utm_source";
export const UTM_MEDIUM_COOKIE = "pf_utm_medium";
export const UTM_CAMPAIGN_COOKIE = "pf_utm_campaign";

export const ATTRIBUTION_MAX_AGE_DAYS = 30;

export type GrowthAttribution = {
  referred_by_slot_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export function parseAttributionFromSearchParams(params: URLSearchParams): GrowthAttribution {
  const out: GrowthAttribution = {};
  const ref = params.get("ref_slot")?.trim();
  if (ref) out.referred_by_slot_id = ref;
  const source = params.get("utm_source")?.trim();
  const medium = params.get("utm_medium")?.trim();
  const campaign = params.get("utm_campaign")?.trim();
  if (source) out.utm_source = source;
  if (medium) out.utm_medium = medium;
  if (campaign) out.utm_campaign = campaign;
  return out;
}

export function attributionToUserMetadata(attr: GrowthAttribution): Record<string, string> {
  const meta: Record<string, string> = {};
  if (attr.referred_by_slot_id) meta.referred_by_slot_id = attr.referred_by_slot_id;
  if (attr.utm_source) meta.utm_source = attr.utm_source;
  if (attr.utm_medium) meta.utm_medium = attr.utm_medium;
  if (attr.utm_campaign) meta.utm_campaign = attr.utm_campaign;
  return meta;
}

export function readAttributionFromCookies(): GrowthAttribution {
  if (typeof document === "undefined") return {};
  const get = (name: string) => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : undefined;
  };
  const out: GrowthAttribution = {};
  const ref = get(REF_SLOT_COOKIE);
  if (ref) out.referred_by_slot_id = ref;
  const source = get(UTM_SOURCE_COOKIE);
  if (source) out.utm_source = source;
  const medium = get(UTM_MEDIUM_COOKIE);
  if (medium) out.utm_medium = medium;
  const campaign = get(UTM_CAMPAIGN_COOKIE);
  if (campaign) out.utm_campaign = campaign;
  return out;
}

export function cookieMaxAgeSec(): number {
  return ATTRIBUTION_MAX_AGE_DAYS * 24 * 60 * 60;
}
