import type { ActivityKey } from "@/lib/activities";
import type { Lang } from "@/lib/i18n-lang";

export const ICON_FEMALE = "♀";
export const ICON_MALE = "♂";
export const ICON_ANY = "◯";

const ACTIVITY_PL: Record<ActivityKey, string> = {
  running: "Bieganie",
  coffee: "Kawa",
  volleyball: "Siatkówka",
  cycling: "Rower",
  boardgames: "Planszówki",
  gym: "Siłownia",
  hiking: "Trekking",
  walking: "Spacer",
  yoga: "Joga",
  movies: "Kino",
  food: "Jedzenie",
  study: "Nauka",
  other: "Inne",
};

export function activityLabel(lang: Lang, key: string): string {
  if (lang === "pl") {
    const k = key as ActivityKey;
    return ACTIVITY_PL[k] ?? key;
  }
  const map: Record<string, string> = {
    running: "Running",
    coffee: "Coffee",
    volleyball: "Volleyball",
    cycling: "Cycling",
    boardgames: "Board games",
    gym: "Gym",
    hiking: "Hiking",
    walking: "Walking",
    yoga: "Yoga",
    movies: "Movies",
    food: "Food",
    study: "Study",
    other: "Other",
  };
  return map[key] ?? key;
}

export function navUi(lang: Lang) {
  return lang === "pl"
    ? { feed: "Feed", map: "Mapa", quest: "Quest", profile: "Profil" }
    : { feed: "Feed", map: "Map", quest: "Quest", profile: "Profile" };
}

export function slotCardUi(lang: Lang) {
  return lang === "pl"
    ? {
        host: "Host",
        partyMembers: "Skład",
        yourQuest: "Twój quest",
        partyFull: "Pełne party",
        accepted: "W party",
        waiting: "Oczekiwanie",
        declined: "Odrzucono",
        apply: "Aplikuj",
        hostDot: "Host",
        guestDot: "Gość",
      }
    : {
        host: "Host",
        partyMembers: "Party members",
        yourQuest: "Your quest",
        partyFull: "Party full",
        accepted: "Accepted to party",
        waiting: "Waiting for approval",
        declined: "Application declined",
        apply: "Apply to party",
        hostDot: "Host spot",
        guestDot: "Guest spot",
      };
}

/** Badge text for slot audience restriction; null if open to everyone. */
export function slotAudienceBadge(lang: Lang, scope: string | undefined | null): string | null {
  const s = scope ?? "any";
  if (s === "any") return null;
  if (s === "female") return lang === "pl" ? `${ICON_FEMALE} Tylko kobiety` : `${ICON_FEMALE} Women only`;
  if (s === "male") return lang === "pl" ? `${ICON_MALE} Tylko mężczyźni` : `${ICON_MALE} Men only`;
  return null;
}

export function genderApplyBlocked(lang: Lang, scope: "female" | "male"): string {
  if (scope === "female") {
    return lang === "pl" ? "To wydarzenie jest tylko dla kobiet." : "This event is for women only.";
  }
  return lang === "pl" ? "To wydarzenie jest tylko dla mężczyzn." : "This event is for men only.";
}

export function feedUi(lang: Lang) {
  return lang === "pl"
    ? {
        title: "Moje party",
        allActivities: "Wszystkie",
        allDates: "Wszystkie daty",
        emptyTitle: "Brak wydarzeń",
        emptyHint: "Utwórz pokój lub zgłoś się na mapie — wtedy pojawi się tutaj.",
        signIn: "Zaloguj się, żeby zobaczyć feed.",
        errorPrefix: "Nie udało się wczytać feedu:",
      }
    : {
        title: "My party feed",
        allActivities: "All",
        allDates: "All dates",
        emptyTitle: "No events in your feed",
        emptyHint: "Create a room or apply on the map to see it here.",
        signIn: "You need to sign in to see your party feed.",
        errorPrefix: "Could not load feed:",
      };
}

export function mapUi(lang: Lang) {
  return lang === "pl"
    ? {
        title: "Mapa",
        loading: "Ładowanie mapy…",
        activity: "Aktywność",
        all: "Wszystkie",
        hostGender: "Płeć hosta",
        audience: "Kto może dołączyć",
        date: "Data",
        radius: "Zasięg od Ciebie",
        results: "Wyniki",
        within: "w promieniu",
        km: "km",
        youHere: "Tu jesteś",
        audienceAll: "Wszystkie wydarzenia",
        audienceOpen: `${ICON_ANY} Bez ograniczeń`,
        audienceWomen: `${ICON_FEMALE} Tylko kobiety`,
        audienceMen: `${ICON_MALE} Tylko mężczyźni`,
      }
    : {
        title: "Map",
        loading: "Loading map…",
        activity: "Activity",
        all: "All",
        hostGender: "Host",
        audience: "Who can join",
        date: "Date",
        radius: "Radius from you",
        results: "Results",
        within: "within",
        km: "km",
        youHere: "You are here",
        audienceAll: "All events",
        audienceOpen: `${ICON_ANY} Open to all`,
        audienceWomen: `${ICON_FEMALE} Women only`,
        audienceMen: `${ICON_MALE} Men only`,
      };
}

export function pageHeaderUi(lang: Lang) {
  return lang === "pl" ? { back: "← Wróć" } : { back: "← Back" };
}

export function slotDetailUi(lang: Lang) {
  return lang === "pl"
    ? {
        quest: "Quest",
        host: "Host",
        partyMembers: "Skład",
        openSpots: "Wolne miejsca dla gości",
        manage: "Zarządzaj party",
        chat: "Czat",
        waiting: "Oczekiwanie na decyzję hosta.",
        rejected: "Host odrzucił aplikację.",
        full: "Party jest pełne.",
        hostTag: "host",
      }
    : {
        quest: "Quest",
        host: "Host",
        partyMembers: "Party members",
        openSpots: "Open guest spots",
        manage: "Manage party",
        chat: "Chat",
        waiting: "Waiting for host approval.",
        rejected: "The host rejected your application.",
        full: "Party is full.",
        hostTag: "host",
      };
}

export function applyFormUi(lang: Lang) {
  return lang === "pl"
    ? {
        messageLabel: "Wiadomość do hosta (opcjonalnie)",
        messagePlaceholder: "Krótko: doświadczenie, oczekiwania, dostępność…",
        submit: "Wyślij aplikację",
        sending: "Wysyłanie…",
        done: "Aplikacja wysłana — poczekaj na decyzję hosta.",
      }
    : {
        messageLabel: "Message to host (optional)",
        messagePlaceholder: "Short intro: experience, expectations, availability…",
        submit: "Apply to party",
        sending: "Sending…",
        done: "Application sent — wait for host decision.",
      };
}
