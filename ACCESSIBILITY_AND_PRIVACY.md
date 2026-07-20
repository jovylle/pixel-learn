# pixel-learn — Accessibility & Privacy

`ONBOARDING_AND_POLISH.md` already covers reduced-motion, keyboard focus, and a
contrast spot-check for the dashboard. This doc rounds out the two things a
kids-facing app can't skip — a bit more accessibility depth, and an explicit
privacy story — without turning either into a compliance project.

> **v1 constraint:** same as everywhere else — local-only, no backend, no
> accounts. That constraint is also most of the privacy answer.

## 1. Accessibility (beyond motion/keyboard/contrast)

### Screen readers / ARIA
- Icon-only controls (`PixelIcon`-based buttons: hamburger, mute toggle, user
  avatar) need an accessible name (`aria-label`), since the pixel icon itself
  conveys nothing to a screen reader.
- `CelebrationOverlay` and toast-style feedback (correct/wrong answer, level-up)
  should be announced via a polite `aria-live` region — sighted users get the
  animation, screen-reader users still get the outcome.
- Decorative-only sprites (`CharacterSprite`, `SlimeNPC`, background art) get
  `aria-hidden="true"` / empty `alt=""` so they don't clutter the reading order;
  the slime's speech-bubble *text* (from `GAMIFICATION.md`'s reaction table) is
  the part that matters and should be in the accessible tree.
- Form controls in `/welcome` (username input, avatar picker) need real
  `<label>`s, not placeholder-as-label.

### Color-blind-safe check
- `PLAN.md`'s palette leans on hue alone in a couple of places that matter for
  correctness feedback (correct/wrong answer states, streak "hot" indicator).
  Rule: any state conveyed by color must also carry a shape/icon/text cue
  (✓/✗ glyph, not just green/red) — cheap to do now, easy to forget once MC
  components are built.

### Text scaling & readability
- `Press Start 2P` is decorative and hard to read at small sizes/long strings —
  confirm it's used only for short headings/labels, with `Pixelify Sans` (or a
  plain system fallback) for body copy and any Grammar/Bookworm reading
  passages, per the font split already implied in `PLAN.md`.
- Respect browser text-zoom (no fixed-px containers that clip text at 150–200%
  zoom) — relevant for Bookworm's reading passages especially.

### i18n stance
- English-only for v1, no RTL/locale switching. Worth stating explicitly here
  so it's a decision, not an oversight — revisit only if a future roadmap item
  (see `ROADMAP_V2.md`) requires it.

## 2. Privacy

### The short version
Nothing leaves the device. There's no account, no server, no analytics, no
third-party script beyond whatever CDN serves the fonts. All state lives in
`localStorage` under the `pixel-learn:*` keys defined in `DATA_MODEL.md`.

### What that means concretely
- **No PII collection beyond a self-chosen username** — and that username is
  never transmitted anywhere; it only renders locally ("Welcome back,
  {username}!").
- **No tracking/analytics SDKs** — not mentioned in any existing doc, and
  intentionally not added. If usage analytics is ever wanted (see
  `ROADMAP_V2.md`), it needs its own privacy note before it ships, since this
  is a kids' app and consent/COPPA-style handling would apply the moment any
  data crosses the network.
- **Mic access (Speaking feature):** already covered functionally in
  `FEATURES.md`/`AUDIO_ASSETS_AND_MEDIA.md` (record-and-playback, local only,
  no upload). Worth restating as a privacy fact, not just a UX fallback: audio
  never leaves the browser tab in v1.
- **Data lifetime:** everything is erasable by the user via the existing
  "reset progress" setting (`NAVBAR_AND_PROFILE.md`) or by clearing browser
  storage — there is no "delete my account" flow to build because there's no
  account.
- **Parents/guardians:** because there's no account or network calls, there is
  no data-sharing risk to disclose to a parent beyond "this runs entirely in
  your browser." That statement itself is worth surfacing somewhere in the UI
  (e.g. a one-line note on `/welcome` or Settings) so it's not just true, but
  visibly true.

> **Future / out of scope for v1:** COPPA-formal consent flows, any analytics
> or crash-reporting integration, server-side storage of user data — all of
> these become relevant only if `ROADMAP_V2.md`'s backend/sync item is ever
> built, and each would need its own privacy pass at that point, not before.
