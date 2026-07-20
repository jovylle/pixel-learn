# pixel-learn — Onboarding & Polish

Two things the other docs assume but never actually specify: **how a new
visitor becomes "urbano"** (or whoever), and the **sound/feel** layer that
sells the RPG theme. Also covers accessibility/motion and the minimal testing
worth doing on the pure gamification logic.

> **v1 constraint:** same as everywhere else — local-only, no backend.

## 1. First-run onboarding

`DATA_MODEL.md` says a default `User` is silently seeded on first load. That's
fine as a fallback, but a one-time flow makes the dashboard's "Welcome back,
{username}!" mean something instead of showing a stranger's placeholder name.

### Flow
1. **Detection:** on app boot, if `pixel-learn:user` doesn't exist yet → route
   to `/welcome` instead of `/` (one-time; never shown again once a `User`
   exists).
2. **`/welcome` — Naming screen** (`WelcomeView.vue`, single `PixelPanel` over
   the same fullscreen background as the dashboard):
   - Pixel-font title: "Welcome, adventurer!"
   - Username input (defaults to a random pixel-y suggestion, e.g.
     "urbano" style generated names — just a small static list to pick from).
   - Avatar picker: a row of ~6 DiceBear pixel-art seeds to choose from, or
     "Randomize" button (writes `avatarSeed`).
   - "Begin Quest" button → creates the `User` record → navigates to `/`.
3. **Optional (nice-to-have, not required for v1 correctness):** a 3-step
   tooltip tour on first dashboard load pointing at Progress card → Learning
   Categories → Recent Activity, dismissible, shown once
   (`localStorage['pixel-learn:onboarded'] = true`).

### Data
- Reuses `User` from `DATA_MODEL.md` — onboarding is just the UI that performs
  the *first write* instead of the silent default-seed fallback.
- Skipping is not allowed (there's nothing to skip *to* — you must name
  yourself before `/` renders), but every field has a sane default so
  "Begin Quest" works with zero typing.

> **Future / out of scope for v1:** multi-step lore/story intro, choosing a
> difficulty/track, importing an existing profile.

## 2. Sound & music

Not in any other doc — a pixel-RPG dashboard with zero audio feedback will
feel flat. Keep it simple: a small SFX set + one looping ambient track.

### Assets needed (add to PLAN.md's asset hunt)
- Short SFX: UI click/hover blip, correct-answer chime, wrong-answer buzz,
  level-up fanfare, achievement unlock jingle, quiz countdown tick.
- One looping ambient track matching the night/castle theme (lo-fi/chiptune,
  quiet, loop-safe). Source: itch.io / OpenGameArt / Kenney audio packs (same
  "pick one pack" philosophy as the visual assets).

### Behavior
- Global mute toggle lives in **Settings** (`SettingsPanel.vue` — add a row:
  "Sound" on/off, default **on** for SFX, music default **off** to avoid
  autoplay-with-sound surprises on load per browser autoplay policies).
- SFX trigger points: button hover/click, MC answer selected (correct/wrong),
  quiz countdown, level-up, achievement unlock, streak milestone — same
  trigger points already defined in `GAMIFICATION.md`'s slime-reaction table,
  just paired with a sound instead of only a speech bubble.
- Implementation: a tiny `useSound()` composable wrapping the native `Audio`
  API (no library needed for this small a set); respects the mute setting and
  `prefers-reduced-motion`-adjacent "reduce audio" isn't a real spec, so just
  gate everything behind the single Settings toggle.

> **Future / out of scope for v1:** dynamic adaptive music, voiced dialogue,
> per-effect volume sliders (one master toggle is enough for v1).

## 3. Accessibility & motion

- **Reduced motion:** celebration overlays (`CelebrationOverlay.vue`, level-up
  animations) must respect `prefers-reduced-motion: reduce` — swap the
  animated version for an instant/static equivalent (still shows the message,
  skips the flourish).
- **Keyboard:** all `PixelButton`/`CategoryPill`/`PixelPanel`-as-button
  variants need visible focus rings (a pixel-styled focus outline, not
  `outline: none` — easy to accidentally lose with custom pixel styling) and
  must be reachable/operable via keyboard (Enter/Space), since the hamburger
  menu, user dropdown, and category grid are all primary navigation.
- **Contrast:** `text-secondary` (`#93a0c9`) on `panel-bg` (`#0e1533`) should
  be spot-checked for WCAG AA on body text sizes — the palette in `PLAN.md`
  reads well for a dark theme but wasn't contrast-audited; do a quick check
  once the theme is implemented, not before.
- **Mic/audio permissions:** already covered per-feature in `FEATURES.md`
  (Speaking's permission-denied fallback); nothing new here beyond noting it
  applies the same "graceful degrade, don't dead-end" rule everywhere audio
  I/O is involved.

## 4. What's worth unit-testing in v1

Most of this app is presentation over a mock store, not worth heavy test
investment. The exception is the **pure logic in `GAMIFICATION.md`** — it's
easy to get subtly wrong and easy to test in isolation:

| Function | Why it's worth a test |
|---|---|
| `xpForLevel(L)` / level-from-xp derivation | Off-by-one errors are easy and silently wrong for a long time |
| Streak transition (`same day` / `+1` / `reset`) | Date-boundary logic, classic source of bugs |
| `evaluateAchievements(state)` | Growing predicate list — a regression here silently stops awarding badges |
| `percentCompleted` calculation | Simple, but feeds the dashboard's headline number |

Suggested tool: **Vitest** (pairs naturally with Vite, no extra config
system). Not required to unblock UI work — add once the store/gamification
module exists, as pure-function tests against plain objects (no component
mounting needed).

> **Future / out of scope for v1:** component/E2E test suite, visual
> regression testing. A handful of pure-logic unit tests is the right amount
> of rigor for a solo pixel-art side project.
