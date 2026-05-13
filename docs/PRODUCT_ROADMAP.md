# PartyFinder — roadmap do „zamkniętego produktu”

Dokument planuje pracę od obecnego MVP do wersji możliwej do skalowania i compliance. Status aktualizuj w commitach / PR.

## Legenda

- [ ] do zrobienia
- [~] w toku / częściowo (wymaga konfiguracji zewnętrznej)
- [x] zrobione (data w commicie)

---

## Faza 1 — Fundament produktu (UX + spójność + prawo + testy dymne)

| # | Zadanie | Uwagi |
|---|---------|--------|
| 1.1 | [x] Roadmap w repo | Ten plik |
| 1.2 | [x] Ikony aktywności SVG (spójny styl WOW) | `ActivityGlyph` + `ActivityIcon` na `activityType` |
| 1.3 | [x] Strony `/legal/privacy`, `/legal/terms` | Szablon PL+EN; **nie zastępuje prawnika** — wersja 1.0 do konsultacji |
| 1.4 | [x] Linki prawne na landingu + publiczna ścieżka w middleware | `/legal/*` |
| 1.5 | [x] SEO landingu (`layout` + Open Graph podstawowe) | `app/landing/layout.tsx` |
| 1.6 | [x] Playwright — smoke (landing, ewentualnie `/auth`) | `npm run test:e2e`; w CI wymaga `npx playwright install` |

## Faza 2 — i18n i copy

| # | Zadanie | Uwagi |
|---|---------|--------|
| 2.1 | [x] Landing PL/EN (cookie + `getServerLang`) | `landingUi` + `LandingTopBar` / przełącznik języka |
| 2.2 | [x] Slot detail, manage, complete, edit profile — pełne i18n | `slotManageUi`, `slotCompleteUi`, `profileEditUi`, `applicationCardUi`, `hostRatingsUi` |
| 2.3 | [x] Błędy serwerowe / puste stany — jednolite komunikaty | `commonErrors` w akcjach (auth, rate limit); toast w ustawieniach (`ToastProvider`) |

## Faza 3 — Powiadomienia i retention

| # | Zadanie | Uwagi |
|---|---------|--------|
| 3.1 | [x] Szablon e-mail (Resend) — aplikacja zaakceptowana | `lib/email.ts` + `notifyApplicationAccepted` w `applications.ts`; wymaga `RESEND_API_KEY` (+ `RESEND_FROM`) |
| 3.2 | [x] Web Push lub decyzja „tylko email” | Decyzja: transakcyjny e-mail; push opisany jako przyszły w ustawieniach |
| 3.3 | [x] Preferencje: kanały powiadomień w `settings` | `user_metadata` (`notify_email_transactional`, `marketing_opt_in`) + `SettingsAccountPanel` |

## Faza 4 — Jakość, bezpieczeństwo, skala

| # | Zadanie | Uwagi |
|---|---------|--------|
| 4.1 | [~] Upgrade Next.js (ścieżka z `npm audit`) | Nadal Next 14.2.x; `npm audit` — ewentualny major upgrade osobno |
| 4.2 | [x] Vitest — czyste funkcje | `npm run test:unit`; `lib/activities.test.ts` |
| 4.3 | [x] Rate limiting na akcjach | `lib/action-rate-limit.ts` — wiadomości, aplikacje, zgłoszenia (na podstawie tabel) |
| 4.4 | [x] Monitoring + logi | `lib/monitoring.ts` + `instrumentation.ts` (hak pod Sentry bez wymuszania paczki) |
| 4.5 | [x] Polityka usuwania konta + eksport danych (RODO art. 15/17) | `app/actions/account-gdpr.ts` + UI w ustawieniach; usunięcie wymaga `SUPABASE_SERVICE_ROLE_KEY` |

## Faza 5 — Produkt „premium”

| # | Zadanie | Uwagi |
|---|---------|--------|
| 5.1 | [x] Onboarding krokowy (cele, miasto, aktywności) | 5 kroków + `sessionStorage` → setup: `home_city`, `quest_goals` w metadata |
| 5.2 | [x] „Pisze…” / presence w czacie | Pusher `client-typing` na `private-slot-*` (wymaga włączonych Client Events w Pusher) |
| 5.3 | [~] Płatności / premium quest | Strona `/premium` (placeholder); Stripe — poza repo do podłączenia |

---

## Kryterium „zamknięty produkt” (checklist biznesowa)

- [x] Polityka prywatności + regulamin opublikowane i podlinkowane w aplikacji | Footer w `AppShell`, landingu, ustawieniach
- [x] Zgody marketingowe / cookies (jeśli stosujesz analitykę niezbędną vs opcjonalną) | `CookieConsent` — niezbędne + link do polityki
- [x] Kanał wsparcia (e-mail / formularz) widoczny w stopce lub ustawieniach | `NEXT_PUBLIC_SUPPORT_EMAIL` + `AppFooter` + sekcja w ustawieniach
- [~] Backup / retention danych w Supabase (polityka po stronie konta) | Notatka w ustawieniach; konfiguracja w panelu Supabase
- [~] Środowisko staging + checklist przed produkcją | Dokumentacja w roadmapie; hosting po stronie zespołu

---

## Uwaga prawna

Teksty w `/legal/*` w repozytorium to **szablon startowy**. Przed uruchomieniem komercyjnym w UE skonsultuj z prawnikiem RODO i lokalnym prawem konsumenckim.

## Zmienne środowiskowe (skrót)

| Zmienna | Cel |
|---------|-----|
| `RESEND_API_KEY`, `RESEND_FROM` | Wysyłka e-maili transakcyjnych |
| `SUPABASE_SERVICE_ROLE_KEY` | Usuwanie konta (`deleteOwnAccount`) + odczyt e-maila aplikanta przy powiadomieniu |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | E-mail wsparcia w UI (domyślnie placeholder) |
