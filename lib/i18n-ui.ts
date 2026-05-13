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

export function slotChatUi(lang: Lang) {
  return lang === "pl"
    ? {
        subtitle: "Czat party — tylko host i zaakceptowani goście",
        empty: "Brak wiadomości — zacznij rozmowę.",
        placeholder: "Napisz wiadomość…",
        send: "Wyślij",
        sending: "Wysyłanie…",
        hostProfile: "Profil hosta",
        sendFailed: "Nie udało się wysłać. Spróbuj ponownie.",
        typing: "Ktoś pisze…",
      }
    : {
        subtitle: "Party chat — host and accepted guests only",
        empty: "No messages yet — say hello.",
        placeholder: "Write a message…",
        send: "Send",
        sending: "Sending…",
        hostProfile: "Host profile",
        sendFailed: "Could not send. Try again.",
        typing: "Someone is typing…",
      };
}

export function notificationsUi(lang: Lang) {
  return lang === "pl"
    ? {
        title: "Powiadomienia",
        markAll: "Oznacz wszystkie jako przeczytane",
        empty:
          "Brak powiadomień. Nowe aplikacje, akceptacje, wiadomości z czatu i przypomnienia o ocenach pojawią się tutaj.",
        openSlot: "Otwórz quest",
        ok: "OK",
      }
    : {
        title: "Notifications",
        markAll: "Mark all as read",
        empty: "No notifications yet. Applications, approvals, chat, and rating reminders will appear here.",
        openSlot: "Open quest",
        ok: "OK",
      };
}

export function settingsUi(lang: Lang) {
  return lang === "pl"
    ? {
        title: "Ustawienia",
        accountHeading: "Konto i prywatność",
        accountBody:
          "Powiadomienia e-mail (gdy skonfigurujesz RESEND_API_KEY po stronie serwera), eksport danych i usunięcie konta — poniżej.",
        prefsLabel: "Preferowane aktywności:",
        prefsNone: "brak",
        notifyHeading: "Powiadomienia",
        notifyEmail: "E-mail (transakcyjne: akceptacja aplikacji, przypomnienia)",
        notifyEmailHint: "Wymaga RESEND_API_KEY na serwerze — bez klucza wysyłka jest pomijana.",
        marketingHeading: "Marketing",
        marketingOptIn: "Chcę otrzymywać wiadomości o nowych funkcjach i wydarzeniach (opcjonalnie)",
        dataHeading: "Dane (RODO)",
        exportButton: "Pobierz kopię moich danych (JSON)",
        deleteButton: "Usuń konto na stałe",
        deleteHint:
          "Usuwa konto w Supabase (wymaga SUPABASE_SERVICE_ROLE_KEY na serwerze). Po usunięciu nastąpi wylogowanie.",
        supportHeading: "Wsparcie",
        supportBody: "Pytania i problemy:",
        legalHeading: "Dokumenty",
        premiumLink: "Premium (planowane)",
        stagingNote:
          "Środowisko staging i polityka backupów: skonfiguruj w panelu Supabase oraz hostingu (patrz roadmap).",
      }
    : {
        title: "Settings",
        accountHeading: "Account and privacy",
        accountBody:
          "Transactional email (when RESEND_API_KEY is set on the server), data export, and account deletion — below.",
        prefsLabel: "Preferred activities:",
        prefsNone: "none",
        notifyHeading: "Notifications",
        notifyEmail: "Email (transactional: application accepted, reminders)",
        notifyEmailHint: "Requires RESEND_API_KEY on the server — without it, sends are skipped.",
        marketingHeading: "Marketing",
        marketingOptIn: "Send me updates about new features and events (optional)",
        dataHeading: "Your data (GDPR)",
        exportButton: "Download a copy of my data (JSON)",
        deleteButton: "Delete my account permanently",
        deleteHint:
          "Deletes the Supabase user (requires SUPABASE_SERVICE_ROLE_KEY on the server). You will be signed out.",
        supportHeading: "Support",
        supportBody: "Questions and issues:",
        legalHeading: "Legal",
        premiumLink: "Premium (planned)",
        stagingNote:
          "Staging and backups: configure in Supabase and your host (see roadmap).",
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

/** Generic server / validation messages for actions */
export function commonErrors(lang: Lang) {
  return lang === "pl"
    ? {
        unauthorized: "Musisz być zalogowany.",
        generic: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
        rateMessages: "Wysłano za dużo wiadomości. Odczekaj minutę.",
        rateApplications: "Zbyt wiele aplikacji w krótkim czasie. Spróbuj później.",
        rateReports: "Zbyt wiele zgłoszeń w krótkim czasie. Spróbuj później.",
      }
    : {
        unauthorized: "You need to be signed in.",
        generic: "Something went wrong. Please try again shortly.",
        rateMessages: "Too many messages. Please wait a minute.",
        rateApplications: "Too many applications in a short window. Try again later.",
        rateReports: "Too many reports in a short window. Try again later.",
      };
}

export function landingUi(lang: Lang) {
  return lang === "pl"
    ? {
        hero: "ZNAJDŹ SWOJE PARTY",
        tagline: "Bieganie. Kawa. Siatkówka. Cokolwiek.",
        activePlayers: "aktywnych graczy w okolicy dziś",
        ctaJoin: "Dołącz do przygody",
        ctaHow: "Pokaż, jak to działa",
        questsTitle: "Aktywne questy w okolicy",
        signInToApply: "Zaloguj się, aby aplikować",
        noSlots: "Brak slotów. Zarejestruj się i utwórz pierwszy.",
        howTitle: "Jak to działa",
        step1Title: "1. Utwórz lub dołącz do questu",
        step1Body: "Otwórz slot z wolnymi miejscami lub aplikuj na slot kogoś z okolicy.",
        step2Title: "2. Host buduje party",
        step2Body: "Host przegląda aplikacje i akceptuje ostateczny skład drużyny.",
        step3Title: "3. Ukończ aktywność i zdobądź EXP",
        step3Body: "Po aktywności obie strony się oceniają i levelują profil.",
        privacy: "Polityka prywatności",
        terms: "Regulamin",
      }
    : {
        hero: "FIND YOUR PARTY",
        tagline: "Running. Coffee. Volleyball. Anything.",
        activePlayers: "active players near you today",
        ctaJoin: "Join the adventure",
        ctaHow: "Show me how it works",
        questsTitle: "Active quests nearby",
        signInToApply: "Sign in to apply",
        noSlots: "No slots yet. Register and create the first one.",
        howTitle: "How it works",
        step1Title: "1. Create or join a quest",
        step1Body: "Open a slot with free spots, or apply to one created by someone nearby.",
        step2Title: "2. Host builds the party",
        step2Body: "The host reviews applicants and accepts the final party lineup.",
        step3Title: "3. Complete activity and gain EXP",
        step3Body: "After the activity, both sides rate each other and level up their profile.",
        privacy: "Privacy policy",
        terms: "Terms of use",
      };
}

export function slotManageUi(lang: Lang) {
  return lang === "pl"
    ? {
        title: "Zarządzaj party",
        inParty: "W party",
        pending: "Oczekujące",
        rejected: "Odrzucone",
        noApplications: "Brak aplikacji.",
        questDone: "Quest ukończony lub anulowany.",
        backDetails: "Wróć do szczegółów",
      }
    : {
        title: "Manage party",
        inParty: "In party",
        pending: "Pending",
        rejected: "Rejected",
        noApplications: "No applications yet.",
        questDone: "Quest is completed or cancelled.",
        backDetails: "Back to details",
      };
}

export function applicationCardUi(lang: Lang) {
  return lang === "pl"
    ? {
        accept: "Akceptuj",
        reject: "Odrzuć",
        inParty: "W party",
        rejected: "Odrzucony",
        exp: "EXP",
      }
    : {
        accept: "Accept",
        reject: "Reject",
        inParty: "In party",
        rejected: "Rejected",
        exp: "EXP",
      };
}

export function slotCompleteUi(lang: Lang) {
  return lang === "pl"
    ? {
        title: "Zakończ quest",
        backManage: "Wróć do zarządzania",
      }
    : {
        title: "Complete quest",
        backManage: "Back to manage",
      };
}

export function hostRatingsUi(lang: Lang) {
  return lang === "pl"
    ? {
        openButton: "Zakończ quest (oceny)",
        title: "Oceń uczestników",
        scoreLabel: "Ocena 1–5",
        showedUp: "Obecny na miejscu",
        comment: "Komentarz (opcjonalnie)",
        submit: "Wyślij oceny",
        saving: "Zapisywanie…",
        cancel: "Anuluj",
        submitClose: "Zapisz i zamknij quest",
      }
    : {
        openButton: "Complete quest (ratings)",
        title: "Rate participants",
        scoreLabel: "Score 1–5",
        showedUp: "Showed up",
        comment: "Comment (optional)",
        submit: "Submit ratings",
        saving: "Saving…",
        cancel: "Cancel",
        submitClose: "Save and close quest",
      };
}

export function profileEditUi(lang: Lang) {
  return lang === "pl"
    ? {
        pageTitle: "Edycja profilu",
        name: "Imię",
        bio: "Bio",
        gender: "Płeć",
        birthDate: "Data urodzenia",
        avatarLabel: "Awatar (z dysku)",
        avatarUploading: "Przesyłanie awatara…",
        avatarDone: "Awatar przesłany.",
        avatarHint: "Opcjonalnie (max 5 MB).",
        save: "Zapisz",
        saving: "Zapisywanie…",
        noAvatarYet: "Brak awatara.",
        avatarMustImage: "Awatar musi być plikiem graficznym.",
        avatarTooBig: "Plik jest za duży (max 5 MB).",
      }
    : {
        pageTitle: "Edit profile",
        name: "Name",
        bio: "Bio",
        gender: "Gender",
        birthDate: "Date of birth",
        avatarLabel: "Avatar (upload from disk)",
        avatarUploading: "Uploading avatar…",
        avatarDone: "Avatar uploaded.",
        avatarHint: "Optional (max 5MB).",
        save: "Save",
        saving: "Saving…",
        noAvatarYet: "No avatar uploaded yet.",
        avatarMustImage: "Avatar must be an image file.",
        avatarTooBig: "Avatar file is too large (max 5MB).",
      };
}

export function onboardingStepsUi(lang: Lang) {
  if (lang === "pl") {
    return [
      {
        title: "Questy w realnym świecie",
        body: "PartyFinder łączy ludzi na spontaniczne aktywności: bieganie, kawa, siatkówka, planszówki i więcej.",
      },
      {
        title: "Zbuduj swoje party",
        body: "Hosty przeglądają aplikacje i akceptują ostateczny skład — jak w MMORPG.",
      },
      {
        title: "Zdobywaj EXP za obecność",
        body: "Kończ aktywności, zbieraj oceny i leveluj swój profil prawdziwego podróżnika.",
      },
      {
        title: "Twój główny cel",
        body: "Co chcesz robić najczęściej? (Opcjonalnie — pomoże dopasować feed po rejestracji.)",
      },
      {
        title: "Miasto / okolica",
        body: "Gdzie grasz najczęściej? Zapiszemy to w profilu po pierwszym logowaniu (opcjonalnie).",
      },
    ];
  }
  return [
    {
      title: "Quests in real life",
      body: "PartyFinder matches people for spontaneous activities: running, coffee, volleyball, board games, and more.",
    },
    {
      title: "Build your party",
      body: "Hosts review applications and accept the final lineup, just like a party finder in MMORPGs.",
    },
    {
      title: "Gain EXP for showing up",
      body: "Complete activities, get rated, and level up your real-life adventurer profile.",
    },
    {
      title: "Your main goal",
      body: "What do you want to do most? (Optional — helps personalize your feed after sign-up.)",
    },
    {
      title: "City / area",
      body: "Where do you usually play? We’ll save this to your profile after first sign-in (optional).",
    },
  ];
}

export function onboardingNavUi(lang: Lang) {
  return lang === "pl"
    ? {
        back: "Wstecz",
        next: "Dalej",
        finish: "Start za 30 sekund",
        busy: "…",
        step: (i: number, total: number) => `Krok ${i + 1} / ${total}`,
        goalPlaceholder: "Np. regularne bieganie, nowi znajomi…",
        cityPlaceholder: "Np. Warszawa, Mokotów",
      }
    : {
        back: "Back",
        next: "Next",
        finish: "Start in 30 seconds",
        busy: "...",
        step: (i: number, total: number) => `Step ${i + 1} / ${total}`,
        goalPlaceholder: "E.g. weekly runs, meeting new people…",
        cityPlaceholder: "E.g. London, Shoreditch",
      };
}

export function cookieBannerUi(lang: Lang) {
  return lang === "pl"
    ? {
        text: "Używamy niezbędnych plików cookie do logowania i języka. Nie uruchamiamy opcjonalnej analityki marketingowej bez Twojej zgody.",
        accept: "Rozumiem",
        learnMore: "Polityka prywatności",
      }
    : {
        text: "We use essential cookies for sign-in and language. We do not run optional marketing analytics without your consent.",
        accept: "OK",
        learnMore: "Privacy policy",
      };
}

export function appFooterUi(lang: Lang) {
  return lang === "pl"
    ? {
        legalPrivacy: "Prywatność",
        legalTerms: "Regulamin",
        support: "Wsparcie",
      }
    : {
        legalPrivacy: "Privacy",
        legalTerms: "Terms",
        support: "Support",
      };
}

export function premiumUi(lang: Lang) {
  return lang === "pl"
    ? {
        title: "Premium (wkrótce)",
        body: "Płatności i questy premium nie są jeszcze włączone. Śledź aktualizacje.",
        back: "Wróć do ustawień",
      }
    : {
        title: "Premium (coming soon)",
        body: "Payments and premium quests are not enabled yet. Stay tuned for updates.",
        back: "Back to settings",
      };
}
