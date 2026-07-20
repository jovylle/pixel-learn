# pixel-learn — Roadmap Beyond v1

Every other doc scopes v1 tightly (local-only, no backend, single user) and
scatters a "Future / out of scope for v1" note at the end of each section.
This doc collects those into one backlog, so extending the app later means
reading one file instead of hunting through seven. Nothing here is scheduled
or committed — it's a parking lot, loosely grouped by what unlocks what.

## Tier 1 — needs a backend (the big unlock)

Almost everything else in this doc depends on this one first: a real server +
database + auth. Until this exists, "v2" for any single feature below isn't
possible.

- **Accounts & multi-device sync** — replace the localStorage-only `User` with
  real auth + server-persisted `AppState`, so progress survives a cleared
  browser or a new device. (`DATA_MODEL.md`, `NAVBAR_AND_PROFILE.md`)
- **Cross-device/session continuity** — resume where you left off on another
  device. Depends entirely on the above.

## Tier 2 — social & competitive features

Depend on Tier 1 (need real accounts to be meaningful).

- **Leaderboards / social sharing of achievements** — currently explicitly
  single-player. (`GAMIFICATION.md`)
- **Streak-freeze / "repair" items** — a monetizable or reward-unlockable
  streak-protection mechanic; also needs timezone-aware server-side streak
  enforcement instead of local device date. (`GAMIFICATION.md`)

## Tier 3 — content & pedagogy depth

Independent of Tier 1 — can happen anytime, gated on content-authoring
bandwidth, not infra.

- **Real speech-to-text scoring for Speaking** — v1 is self-rated
  record-and-playback only, no automated pronunciation scoring, no
  upload/teacher review. (`FEATURES.md`, `AUDIO_ASSETS_AND_MEDIA.md`)
- **Adaptive difficulty** — content currently has a static difficulty tag
  (`CONTENT_AUTHORING.md`); an adaptive system that adjusts based on
  performance is a real pedagogy project, not a schema tweak.
- **CMS / non-developer content authoring** — v1 authoring is "hand-edit a
  JSON file" (`CONTENT_AUTHORING.md`); a real content team would need an
  actual authoring UI + validation tooling, likely paired with Tier 1's
  backend for storage.
- **Localization / multi-language content** — currently English-only by
  omission, not by explicit non-goal; would need both UI i18n and translated
  content sets. (`ACCESSIBILITY_AND_PRIVACY.md`)

## Tier 4 — oversight & adult-facing features

New surface area, not just an extension of existing features.

- **Parent/teacher dashboard** — view a learner's progress, streaks, and
  activity from an adult account. Needs Tier 1 (accounts) plus a new
  permission model (adult can view, not edit, a child's `AppState`).
- **Notifications/reminders** — "come back and keep your streak" style nudges.
  Needs either push notification infra or email, both server-dependent.

## Tier 5 — engagement polish (no infra dependency)

Can be picked up independently, closest to "nice next thing" for a solo dev.

- **Voiced dialogue** for the slime NPC instead of canned text lines.
  (`GAMIFICATION.md`)
- **Adaptive/dynamic ambient music** instead of one static loop; per-effect
  volume sliders instead of a single mute toggle. (`ONBOARDING_AND_POLISH.md`,
  `AUDIO_ASSETS_AND_MEDIA.md`)
- **Dynamic dialogue trees / NPC mini-quests** for the slime, beyond a lookup
  table keyed on state. (`GAMIFICATION.md`)
- **Component/E2E/visual-regression test suite** — v1 intentionally limits
  testing to pure-function unit tests (`TESTING_STRATEGY.md`); worth
  revisiting once the UI is stable enough that regressions are costly.

## Explicitly not a goal (unless something changes)

- **Monetization** — never mentioned in any v1 doc; this is a hobby project,
  not a product with a business model. If that ever changes, it needs its own
  design doc, not a bullet here.
- **Analytics/telemetry** — deliberately absent per
  `ACCESSIBILITY_AND_PRIVACY.md`'s privacy stance; adding it later requires a
  privacy-policy pass first, not just a script tag.
