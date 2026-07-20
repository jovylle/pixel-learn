# pixel-learn — Audio Assets & Media (Listening / Speaking / SFX)

`FEATURES.md` specs the Listening and Speaking quests, `ONBOARDING_AND_POLISH.md`
specs the SFX/ambient-music list and the single mute toggle, and `DATA_MODEL.md`
already reserves `audioSrc` / `referenceAudioSrc` fields on `ListeningClip` /
`SpeakingPrompt`. None of the three docs say where the actual files live or how
playback is wired up — that's this doc's job. No new runtime dependency is
required; `package.json` stays as-is (native Web Audio / `<audio>` /
`MediaRecorder` only).

> **v1 constraint:** same as everywhere else — static bundled files, no
> backend, no server-side processing of any audio (playback or recorded).

---

## 1. Where audio files live & how content references them

**Location:** `public/audio/` (not `src/assets/audio/`), split into
sub-folders by use:

```
public/audio/
  sfx/          click.mp3, hover.mp3, correct.mp3, wrong.mp3,
                level-up.mp3, achievement.mp3, tick.mp3
  music/        ambient-loop.mp3
  listening/    cafe-order.mp3, train-station.mp3, job-interview.mp3, weather-report.mp3
  speaking/     greetings-ref.mp3, directions-ref.mp3, small-talk-ref.mp3, ordering-food-ref.mp3
```

**Why `public/` instead of `src/assets/`:** `FEATURES.md` and `DATA_MODEL.md`
both say `src/assets/audio/`, but for this project that's worth overriding —
Vite fingerprints/hashes anything imported from `src/assets/` and inlines
small files as base64, which is the wrong tradeoff for audio: these files are
already-final content (not build-time-processed), several are a few hundred
KB to a few MB, and referencing them by a **plain, predictable path** (not an
import) keeps `listening.json` / `speaking.json` decoupled from the bundler.
`public/` is served as-is at the site root, so `audioSrc: "/audio/listening/cafe-order.mp3"`
works identically in dev and in the Cloudflare static deploy with zero build
step. Treat this as a deliberate correction to the two other docs, not a
contradiction to leave unresolved — content JSON should be updated to match
this doc's paths when the files are actually sourced.

**Naming convention:**
- File name = content item's `id` suffix (the part after the `:`), kebab-case,
  matching what's already in `listening.json` / `speaking.json`
  (`listening:cafe-order` → `cafe-order.mp3`).
- SFX files are named for the trigger, not the emotion (`correct.mp3` /
  `wrong.mp3`, not `chime.mp3` / `buzz.mp3`) so the mapping in code stays
  self-explanatory.
- Format: **MP3** for everything (broadest browser support, smallest file
  size for spoken-word/short SFX; no need for OGG fallback — evergreen
  browsers targeted, no IE-era constraint here). Keep SFX under ~50KB and
  listening clips under ~1MB each; that's a UI/perf concern, not a hard rule.

**Content JSON changes needed** (tracked here, not yet applied — sourcing is
still unresolved per `PLAN.md`): once real files exist, add
`"audioSrc": "/audio/listening/cafe-order.mp3"` to each entry in
`listening.json`, and optionally `"referenceAudioSrc": "/audio/speaking/greetings-ref.mp3"`
to `speaking.json` entries that get a recorded reference. Until asset
sourcing happens, these fields are simply absent — `ListeningClip.audioSrc` in
`DATA_MODEL.md` is typed as required, so the Listening list view should treat
a missing/placeholder path as its existing `empty`/"Couldn't load this
content" state rather than crash.

---

## 2. Listening playback: native `<audio>` is sufficient

**Recommendation: no library.** The Listening player needs play/pause, a
scrubber, replay, and 0.75×/1× speed — every one of those is a native
`HTMLAudioElement` capability (`.play()`, `.pause()`, `.currentTime`,
`.playbackRate`) with zero extra dependency weight. A library (Howler.js etc.)
earns its cost when you need mixing, spatial audio, or many concurrent
sources — none of which apply to "one clip playing at a time in a quest
view." Pulling one in here would be the kind of dependency PLAN.md's
minimalist stack doesn't call for.

**Composable pattern — `useAudioPlayer(src)`** (Listening clip player), living
alongside the existing `src/lib/*.js` helpers (`date.js`, `gamification.js`,
etc. — no `composables/` folder exists yet, this would be the first one,
likely `src/lib/useAudioPlayer.js` or a new `src/composables/` dir if more
than one composable shows up at once):

- Wraps a single `Audio(src)` instance created lazily on first play (avoids
  loading audio the user never opens).
- Exposes reactive state: `isPlaying`, `currentTime`, `duration`,
  `playbackRate`.
- Exposes actions: `play()`, `pause()`, `toggle()`, `seek(seconds)`,
  `replay()` (seek to 0 + play), `setRate(0.75 | 1)`.
- Listens to the underlying element's `timeupdate`/`ended`/`loadedmetadata`
  events to keep the reactive state in sync (`isPlaying = false` on `ended`,
  don't auto-replay).
- Cleans up (`pause()` + drop the `Audio` instance) on component unmount so
  navigating away from the Player view can't leave audio playing in the
  background — there's no persistent mini-player in this app.

**Composable pattern — `useSound()`** (SFX + ambient music, per
`ONBOARDING_AND_POLISH.md` section 2): a second, simpler composable/module —
this is the one that doc already names and describes ("tiny `useSound()`
composable wrapping the native `Audio` API"). This doc just pins down how it
interacts with playback elsewhere:

- Reads the single Settings **"Sound" on/off** toggle (persisted the same way
  other settings/localStorage values are in this app) — call the mute-state
  source `isSoundEnabled` for concreteness.
- `playSfx(name)` looks up a small static map (`{ click: '/audio/sfx/click.mp3', correct: '/audio/sfx/correct.mp3', ... }`)
  and no-ops entirely if `isSoundEnabled` is false — don't even construct an
  `Audio` object when muted, to avoid wasted network/decode work.
- Ambient music (`playMusic()` / `stopMusic()`) is a **separate** on/off state
  from SFX per `ONBOARDING_AND_POLISH.md` ("music default off to avoid
  autoplay-with-sound surprises") — same composable, different flag, so
  Settings can show one row that gates both or two rows later without
  redesigning the composable's shape.
- `useAudioPlayer` (Listening clips) and `useSound` (SFX/music) are
  intentionally separate: clip playback is never muted by the SFX/music
  toggle (a Listening comprehension check with no audio would defeat the
  feature) — the Settings toggle in v1 only gates ambient UI sound, never
  content the user explicitly opened to listen to.

---

## 3. Speaking in v1: record + playback self-check, not graded

`FEATURES.md` already commits to this (browser `MediaRecorder`, self-rating,
explicitly "no cloud speech scoring in v1"); this section just makes the
non-STT boundary explicit for anyone implementing it, since "speaking
practice" naturally invites scope creep toward automated scoring.

- **What v1 does:** `navigator.mediaDevices.getUserMedia({ audio: true })` →
  `MediaRecorder` captures a `Blob` while the user holds/toggles the mic
  button → on stop, wrap the blob in `URL.createObjectURL()` and hand that to
  a plain `<audio>` element (or the same `useAudioPlayer` composable from
  §2) for immediate local playback next to the optional reference audio.
- **What v1 explicitly does NOT do:** no waveform/pronunciation comparison, no
  phoneme scoring, no `SpeechRecognition`/Web Speech API transcript, no
  upload/`fetch()` of the recording anywhere, no persistence of the recording
  past the session (matches `FEATURES.md`: "Recordings are NOT persisted").
  The **only** score that exists is the user's own 1–3 star self-rating,
  written to `ProgressRecord.selfScore` — this is a self-assessment UX, full
  stop, not an evaluation the app performs on their voice.
- **Object URL lifecycle:** revoke the object URL (`URL.revokeObjectURL`) on
  re-record and on leaving the Practice view — recordings live only as long as
  the view is mounted, reinforcing "discarded on navigation" from
  `FEATURES.md` and avoiding a memory leak across repeated re-records in one
  session.
- **Permission-denied path:** already specced in `FEATURES.md` (degraded
  "practice without recording" mode) — no change here, just confirming the
  mic-permission check happens once per Practice view mount via a
  `try { getUserMedia } catch` before showing the record button, not
  preemptively on the Prompt list.
- If future/out-of-scope STT ever gets built, it would be an *additive*
  feature layered on top of this same record/playback flow (a real score
  replacing or supplementing the self-rating) — nothing in this v1 design
  needs to change to allow that later.

---

## 4. Sourcing SFX / clips: where to actually get files

Short, actionable — not exhaustive research, per `PLAN.md`'s "pick one pack"
philosophy already applied to visual assets.

**Public-domain / CC0 SFX (UI blips, chimes, buzzes, fanfare, tick):**
- **Kenney Game Assets** (kenney.nl) — has ready-made UI/SFX packs
  (`"Interface Sounds"`, `"UI Audio"`) explicitly CC0, pixel/retro-game
  flavored, matches the "same pick-one-pack philosophy as the visual assets"
  already called out in `ONBOARDING_AND_POLISH.md`. **First choice** — single
  pack likely covers click/hover/correct/wrong/level-up/achievement/tick in
  one download with a consistent sound palette.
- **Freesound.org** — filter by CC0 license, search terms like "8bit chime",
  "retro correct", "coin", "game over buzz". Good fallback for anything
  Kenney's pack doesn't cover; check each individual clip's license tag (not
  all of Freesound is CC0 — some require attribution).
- **OpenGameArt.org** — same category as the visual-asset hunt in `PLAN.md`;
  has an "Audio" section with CC0/CC-BY chiptune SFX and loop-safe ambient
  tracks (covers the "one looping ambient track" need too).

**Ambient/loop music (night/castle chiptune, per `ONBOARDING_AND_POLISH.md`):**
- Same three sources above — Kenney's music packs and OpenGameArt both have
  loop-safe chiptune tracks; verify "loop-safe" by ear (no audible seam at the
  loop point) before committing to one.
- Alternative: **itch.io** free chiptune/lo-fi asset packs (search "royalty
  free chiptune loop") — same as the visual-asset sourcing note in `PLAN.md`.

**Listening clip content (dialogues/narrations) — no natural-recording budget:**
- **Text-to-speech generation** is the pragmatic v1 path since these are
  short scripted dialogues, not found audio: browser-side, the **Web Speech
  API `SpeechSynthesis`** could theoretically generate these on the fly for
  free, but per `FEATURES.md`'s "no streaming/generated audio, v1 bundles a
  small fixed set of clips as static files" constraint, generate the 4 clips
  **once, offline**, and export/save the audio as static MP3 files rather
  than synthesizing at runtime (avoids voice-quality inconsistency across
  browsers/OSes and keeps the "static bundled files" guarantee).
- Any offline TTS tool/service works for this one-time generation step (e.g.
  a system "say"-style tool, a free-tier cloud TTS console export, or a
  desktop TTS app) — this is a build-time asset-creation step, not a runtime
  dependency, so it doesn't affect `package.json`.
- **Reference audio for Speaking prompts** (`referenceAudioSrc`) — same
  approach: TTS-generate once per `targetText`, save as static files under
  `public/audio/speaking/`. Optional per `DATA_MODEL.md` (`referenceAudioSrc?`)
  — fine to ship v1 without it and add later.

> **Future / out of scope for v1:** commissioning original voice recordings,
> licensed music, per-clip attribution UI (only needed if a non-CC0/non-public-
> domain source is used — prefer CC0 specifically to avoid needing one).
