# pixel-learn — Feature Specs

Expands each **Learning Category** pill from the dashboard into a full feature
module. Every feature is a self-contained "quest" that reads/writes the shared
mock data (see `DATA_MODEL.md`) and feeds the dashboard Stats, Progress bar,
Achievements, and Recent Activity.

> **v1 constraint:** mock data only, no backend. All content (passages, quiz
> banks, grammar drills, audio clips) ships as static JSON/asset files bundled
> in `src/assets/` or `src/data/`. State persists to `localStorage` only.

## Shared feature contract

Every feature module follows the same lifecycle so the dashboard can treat them
uniformly:

| Stage | What happens |
|---|---|
| **Entry** | User clicks a category pill on Dashboard (or nav link) → route change |
| **Select** | Pick an item (passage / quiz / lesson / clip / prompt) from a list |
| **Play** | Work through the activity's steps |
| **Complete** | Score computed → XP awarded → progress updated → activity logged → possible achievement unlock |
| **Reward** | Completion screen: XP gained, streak status, slime NPC reaction |

**Common UI states** (all features must handle): `empty` (nothing available /
all done), `loading` (assets resolving), `list` (pick an item), `in-progress`
(the activity), `complete` (reward screen). Errors in v1 are minimal — a
static "Couldn't load this content" panel.

**Common data writes** on completion (see `DATA_MODEL.md` for shapes):
- `ProgressRecord` for the item (status, score, timestamps)
- XP added to `User.xp` (may trigger level-up)
- `ActivityLogEntry` appended
- Streak check (see `GAMIFICATION.md`)
- Achievement evaluation pass

---

## 1. Book worm 📖

Reading passages / short stories, progressed through a themed **library**, each
followed by a comprehension check.

**Concept:** A shelf of "books" (short leveled passages). Reading a book +
passing its comprehension questions marks it complete and contributes reading
time to the dashboard.

### User flow
1. Entry → **Library** view: grid of book cards (cover, title, level badge,
   est. read time, completion checkmark).
2. Select a book → **Reader** view: passage text in a scroll/parchment panel,
   font size toggle, "I'm done reading" button. Reading time is tracked while
   the reader is open.
3. On "done reading" → **Comprehension** view: 3–5 multiple-choice questions
   about the passage.
4. Submit → score. Pass threshold (e.g. ≥ 60%) marks the book `complete`.
5. **Reward:** XP based on score + reading-time bonus; book gets a checkmark.

### Data read / write
- Reads: `library` (static passages + questions), existing `ProgressRecord`s.
- Writes: `ProgressRecord` (status, score), `readingSeconds` accumulated into
  `User.stats.readingSeconds`, `ActivityLogEntry` ("Finished reading *{title}*"),
  XP, achievements.

### Dashboard hooks
- **Reading Time** stat = sum of `readingSeconds` (shown as hours).
- **Lessons** stat counts completed books alongside other completed items.
- Contributes to overall **% Completed**.

### UI states
`empty` = "Your shelf is empty" (shouldn't happen in v1 — content is bundled);
`list` = library grid; `in-progress` = reader + comprehension; `complete` =
reward with a "next book" suggestion.

---

## 2. Pop up Quiz! ⚡

Quick, snappy multiple-choice quizzes — the "arcade" mode. Short bursts (5–10
questions), lightly **timed**, tied heavily to **XP and streaks**.

**Concept:** Pull N random questions from a mixed bank across topics
(vocabulary, quick grammar, spelling). Emphasis on speed and streak-building,
not long lessons. May be surfaced as a "Pop up!" prompt from the dashboard.

### User flow
1. Entry → **Quiz intro** panel: "Ready? {N} questions, {seconds}s each." Start
   button.
2. Per question: prompt + 4 options + a per-question countdown ring. Selecting
   an answer (or timeout) advances immediately with quick correct/incorrect
   feedback flash.
3. After last question → **Results:** score, fastest answer, correct streak,
   XP earned.
4. **Reward:** XP scaled by correctness + speed bonus; updates daily streak.

> **Future / out of scope for v1:** genuinely "random pop-up" triggering across
> the app (interrupting other screens). v1 treats Pop up Quiz! as a normal
> category you enter deliberately; the "pop up" framing is cosmetic.

### Data read / write
- Reads: `quizBank` (static), streak state.
- Writes: `ProgressRecord` (quiz session, score), `ActivityLogEntry`
  ("Scored {x}/{n} on a Pop up Quiz!"), XP, streak update, achievements
  (e.g. perfect score, speed demon).

### Dashboard hooks
- Feeds **Achievements** (streak/perfect-score badges) and XP → **Progress**.
- Quiz sessions appear in **Recent Activity**.

### UI states
`intro` → `in-progress` (per-question) → `complete`. `loading` while bank
resolves. No true `empty` — bank is always populated.

---

## 3. Grammar ✏️

Structured lessons and drills. The most "school-like" module: a short teaching
card followed by mixed exercise drills.

**Concept:** Ordered grammar **topics** (e.g. Present Simple, Articles,
Prepositions). Each topic = a brief explanation card + a drill set of mixed
exercise types. Topics unlock in sequence to give a sense of a curriculum.

### Exercise types
| Type | Interaction |
|---|---|
| **Fill in the blank** | Type or pick the missing word |
| **Multiple choice** | Pick the correct option |
| **Sentence reorder** | Drag word/phrase tiles into correct order |

### User flow
1. Entry → **Topic list**: ordered topics with lock/complete state and a small
   mastery bar per topic.
2. Select a topic → **Lesson card**: concise explanation + examples ("Got it"
   button).
3. → **Drill**: sequence of mixed exercises with immediate check-answer
   feedback and a retry-on-wrong option.
4. Finish drill → score → topic marked `complete` (or `in-progress` if below
   mastery threshold), unlocking the next topic.
5. **Reward:** XP + mastery bump; achievement checks (e.g. "Grammar Guardian").

### Data read / write
- Reads: `grammarTopics` (static lessons + drills), progress (for unlock gating).
- Writes: `ProgressRecord` per topic (status, mastery %, score),
  `ActivityLogEntry`, XP, achievements.

### Dashboard hooks
- Completed topics count toward **Lessons** and **% Completed**.
- Mastery milestones can unlock achievements.

### UI states
`list` (topics, some locked) → `lesson` → `drill` (in-progress) → `complete`.
`empty` shows only if a filter yields nothing (not expected in v1).

---

## 4. Listening 🎧

Audio clips + comprehension questions with real playback controls.

**Concept:** A list of short audio clips (dialogues, narrations). Listen (replay
allowed), then answer comprehension questions. Focus on the custom pixel-styled
audio player.

### User flow
1. Entry → **Clip list**: cards with title, duration, level, completion state.
2. Select a clip → **Player** view: pixel-styled audio player (play/pause,
   scrubber, replay, playback speed 0.75×/1×), optional "show transcript"
   toggle (hidden by default to keep it a listening test).
3. → **Comprehension**: multiple-choice / fill-in questions about the clip.
4. Submit → score → clip `complete`.
5. **Reward:** XP by score; replays allowed but don't penalize.

### Data read / write
- Reads: `listeningClips` (static audio files in `src/assets/audio/` + question
  sets + transcripts).
- Writes: `ProgressRecord`, `ActivityLogEntry` ("Completed listening: *{title}*"),
  XP, achievements.

### Dashboard hooks
- Counts toward **Lessons** / **% Completed**.
- Optional listening-specific achievement (e.g. "Good Ear").

### UI states
`list` → `player` (loading audio → ready → playing) → `comprehension`
(in-progress) → `complete`.

> **Future / out of scope for v1:** streaming/generated audio. v1 bundles a
> small fixed set of clips as static files.

---

## 5. Speaking 🎙️

Pronunciation practice via mic recording + **self-assessment**.

**Concept:** Show a target word/sentence, let the user record themselves using
the browser `MediaRecorder` API, play back their recording next to a reference,
and self-rate. No cloud speech scoring in v1.

### User flow
1. Entry → **Prompt list**: sentences/words to practice (level, completion).
2. Select → **Practice** view: target sentence displayed (+ optional reference
   audio to mimic). Big mic button to record → stop → local playback of the
   recording.
3. User compares to reference and **self-scores** (e.g. 1–3 stars: "Tricky /
   Okay / Nailed it"). Re-record allowed.
4. Confirm → prompt `complete` at the self-rated score.
5. **Reward:** XP (flat + bonus for higher self-rating); achievement checks.

### Data read / write
- Reads: `speakingPrompts` (static sentences + optional reference audio).
- Writes: `ProgressRecord` (with `selfScore`), `ActivityLogEntry`
  ("Practiced speaking: *{prompt}*"), XP, achievements.
- **Recordings are NOT persisted** — they live in memory / object URLs for the
  session only and are discarded on navigation. No upload.

### Dashboard hooks
- Counts toward **Lessons** / **% Completed**.
- Speaking-specific achievement (e.g. "Silver Tongue").

### UI states
`list` → `practice` (idle → recording → recorded/playback) → `complete`.
Must gracefully handle **mic permission denied** → fallback panel explaining
mic is needed, with a "practice without recording" (read-aloud + self-score)
degraded mode.

> **Future / out of scope for v1:** automated pronunciation scoring, speech-to-
> text, uploading recordings to a server, teacher review. All explicitly later.

---

## Cross-feature summary

| Feature | Core interaction | Writes to Reading Time? | Timed? | Special hardware |
|---|---|---|---|---|
| Book worm | Read + comprehension MCQ | ✅ yes | no | — |
| Pop up Quiz! | Rapid MCQ | no | ✅ yes | — |
| Grammar | Lesson + mixed drills | no | no | — |
| Listening | Audio + comprehension | no | no | audio playback |
| Speaking | Record + self-assess | no | no | microphone |

All five write `ProgressRecord`, XP, `ActivityLogEntry`, and run the achievement
evaluation pass on completion — that uniformity is what keeps the dashboard a
thin aggregation layer over the mock store.
