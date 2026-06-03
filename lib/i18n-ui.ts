export const ICON_FEMALE = "♀";
export const ICON_MALE = "♂";
export const ICON_ANY = "◯";

export function activityLabel(key: string): string {
  const map: Record<string, string> = {
    running: "Running",
    coffee: "Coffee",
    volleyball: "Volleyball",
    cycling: "Cycling",
    boardgames: "Board games",
    gym: "Gym",
    hiking: "Hiking",
    walking: "Walking",
    dog_walk: "Dog walk",
    playground: "Playground",
    football: "Football",
    park: "Park meetup",
    yoga: "Yoga",
    movies: "Movies",
    food: "Food",
    study: "Study",
    padel: "Padel",
    tennis: "Tennis",
    basketball: "Basketball",
    other: "Other",
  };
  return map[key] ?? key;
}

export function navUi() {
  return { feed: "Feed", map: "Map", quest: "Quest", profile: "Profile" };
}

export function slotCardUi() {
  return {
    host: "Host",
    partyMembers: "Party members",
    viewDetails: "View Details",
    joinQuest: "Join slot",
    partyFull: "Party full",
    accepted: "Accepted to party",
    waiting: "Waiting for approval",
    declined: "Application declined",
    hostDot: "Host spot",
    guestDot: "Guest spot",
  };
}

/** Badge text for slot audience restriction; null if open to everyone. */
export function slotAudienceBadge(scope: string | undefined | null): string | null {
  const s = scope ?? "any";
  if (s === "any") return null;
  if (s === "female") return `${ICON_FEMALE} Women only`;
  if (s === "male") return `${ICON_MALE} Men only`;
  return null;
}

export function genderApplyBlocked(scope: "female" | "male"): string {
  if (scope === "female") {
    return "This event is for women only.";
  }
  return "This event is for men only.";
}

export function feedUi() {
  return {
    title: "Discover",
    subtitle: "Quests and crews near you",
    heroCta: "Open map",
    nearbySection: "Nearby",
    allQuests: "All quests",
    allActivities: "All",
    allDates: "All dates",
    emptyTitle: "No quests nearby",
    emptySubtitle: "Be the first — pick a place on the map and invite your crew.",
    emptyBody:
      "Nobody has planned anything nearby yet. One meetup starts the loop — share the link with friends.",
    goToMap: "Go to map",
    createQuest: "Create slot",
    signIn: "You need to sign in to see quests.",
    errorPrefix: "Could not load feed:",
  };
}

export function mapUi() {
  return {
    title: "Map",
    loading: "Loading map…",
    placeCategory: "Activity",
    all: "All",
    date: "Date",
    onlyOpenSlots: "Open spots",
    onlyOpenSlotsHint: "Only slots with free spots",
    radius: "Radius from you",
    useMyLocation: "Near me",
    searchPlaceholder: "Search places…",
    filters: "Filters",
    listTitle: "Places",
    locationDenied: "Location access denied",
    nearbyFab: "Nearby",
    nearbyTitle: "Places near you",
    nearbySlotsTitle: "Slots near you",
    nearbyPromptTitle: "Find spots around you",
    nearbyPromptBody:
      "Allow location access to see the closest places and sort results by distance. We never store your exact location.",
    nearbyAllow: "Allow location",
    nearbyNotNow: "Not now",
    nearbyLoading: "Getting your location…",
    nearbyWithin: (km: number) => `Within ${km} km · sorted by distance`,
    nearbyTapHint: "Tap a place to view on map",
    nearbyEmpty: (km: number) => `No places within ${km} km — try a wider radius.`,
    nearbyCount: (n: number) => (n === 1 ? "1 place" : `${n} places`),
    resultsFound: (n: number) => (n === 1 ? "1 place found" : `${n} places found`),
    within: "within",
    km: "km",
    youHere: "You are here",
    popupUpcoming: "Upcoming slots",
    popupNoSlots: "No active slots",
    popupSpots: "spots",
    popupSlotsBadge: "slots",
    popupCreateSlot: "+ Create slot",
    popupViewAll: "View all",
    guestHint: "Browsing without an account. Sign in to host or join a slot.",
  };
}

export function pageHeaderUi() {
  return { back: "← Back" };
}

export function slotDetailUi() {
  return {
    quest: "Quest",
    host: "Host",
    partyMembers: "Party members",
    openSpots: "Open guest spots",
    manage: "Manage party",
    editQuest: "Edit",
    chat: "Chat",
    waiting: "Waiting for host approval.",
    rejected: "The host rejected your application.",
    full: "Party is full.",
    hostTag: "host",
    shareInvite: "Invite friends",
  };
}

export function growthUi() {
  return {
    shareTitle: "Share this meetup",
    shareHint: "Generate an invite and send the link — each share brings new people.",
    shareButton: "Share",
    copy: "Copy text",
    copied: "Copied",
    prepare: "Prepare text",
    loading: "Generating…",
    loadError: "Could not prepare the invite.",
    copyError: "Could not copy.",
  };
}

export function slotChatUi() {
  return {
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

export function notificationsUi() {
  return {
    title: "Notifications",
    markAll: "Mark all as read",
    empty: "No notifications yet. Applications, approvals, chat, and rating reminders will appear here.",
    openSlot: "Open slot",
    rateSlot: "Rate participants",
    ok: "OK",
  };
}

export function settingsUi() {
  return {
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

export function applyFormUi() {
  return {
    messageLabel: "Message to host (optional)",
    messagePlaceholder: "Short intro: experience, expectations, availability…",
    submit: "Apply to party",
    sending: "Sending…",
    done: "Application sent — wait for host decision.",
  };
}

/** Generic server / validation messages for actions */
export function commonErrors() {
  return {
    unauthorized: "You need to be signed in.",
    generic: "Something went wrong. Please try again shortly.",
    rateMessages: "Too many messages. Please wait a minute.",
    rateApplications: "Too many applications in a short window. Try again later.",
    rateReports: "Too many reports in a short window. Try again later.",
  };
}

export function landingUi() {
  return {
    hero: "FIND YOUR CREW IN AUSTIN",
    tagline: "Dog walks. Runs. Parks. Real meetups — share a link, fill your party.",
    activePlayers: "active players in Austin today",
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

export function slotManageUi() {
  return {
    title: "Manage party",
    inParty: "In party",
    pending: "Pending",
    rejected: "Rejected",
    noApplications: "No applications yet.",
    questDone: "Quest is completed or cancelled.",
    backDetails: "Back to details",
    editQuest: "Edit quest",
    cancelQuest: "Cancel quest",
    deleteQuest: "Delete permanently",
    confirmCancel: "Cancel this quest? Participants will see it as cancelled.",
    confirmDelete:
      "Permanently delete this quest? Applications, chat, and ratings for this slot will be removed. This cannot be undone.",
    toolbarHint: "Edit details, cancel, or permanently delete the quest.",
  };
}

export function applicationCardUi() {
  return {
    accept: "Accept",
    reject: "Reject",
    inParty: "In party",
    rejected: "Rejected",
    exp: "EXP",
    toPending: "Move to pending",
    removeFromParty: "Remove from party",
    acceptAgain: "Accept again",
  };
}

export function slotCompleteUi() {
  return {
    title: "Complete quest",
    backManage: "Back to manage",
  };
}

export function slotRateUi() {
  return {
    title: "Rate participants",
    subtitle: "Rate everyone from your party — it only takes a moment.",
    scoreLabel: "Score 1–5",
    showedUp: "Showed up",
    comment: "Comment (optional)",
    submit: "Submit ratings",
    saving: "Saving…",
    noPeers: "No one to rate.",
    allDone: "All ratings saved. Thanks!",
    backProfile: "Back to profile",
  };
}

export function pendingRatingsUi() {
  return {
    title: "Ratings waiting",
    oneSlot: (title: string, n: number) =>
      `"${title}" — ${n} ${n === 1 ? "person" : "people"} left to rate.`,
    manySlots: (n: number) => `You have ratings to complete in ${n} slots.`,
    cta: "Rate now",
  };
}

export function hostRatingsUi() {
  return {
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

export function profileUi() {
  return {
    title: "Profile",
    edit: "Edit",
    reliability: "Reliability",
    events: "Events",
    host: "Host",
    rating: "Rating",
    noRatings: "No ratings yet",
    activityClasses: "Activity classes",
    badges: "Badges",
    noBadges: "No badges unlocked yet",
    signOut: "Sign out",
    settings: "Settings",
    maxLevel: "Max level",
  };
}

export function profileEditUi() {
  return {
    pageTitle: "Edit profile",
    name: "Name",
    bio: "Bio",
    bioPlaceholder: "Tell others about yourself…",
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

export function onboardingStepsUi() {
  return [
    {
      title: "Quests in real life",
      body: "lfparty matches people for spontaneous activities: running, coffee, volleyball, board games, and more.",
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

export function onboardingNavUi() {
  return {
    back: "Back",
    next: "Next",
    finish: "Start in 30 seconds",
    busy: "...",
    step: (i: number, total: number) => `Step ${i + 1} / ${total}`,
    goalPlaceholder: "E.g. weekly runs, meeting new people…",
    cityPlaceholder: "e.g. Austin, Zilker",
  };
}

export function cookieBannerUi() {
  return {
    text: "We use essential cookies for sign-in and language. We do not run optional marketing analytics without your consent.",
    accept: "OK",
    learnMore: "Privacy policy",
  };
}

export function appFooterUi() {
  return {
    legalPrivacy: "Privacy",
    legalTerms: "Terms",
    support: "Support",
  };
}

export function premiumUi() {
  return {
    title: "Premium (coming soon)",
    body: "Payments and premium quests are not enabled yet. Stay tuned for updates.",
    back: "Back to settings",
  };
}
