# pixel-learn — Content Authoring Guide

How to add or edit the static content that powers the five features (see
`FEATURES.md`) and hydrates the `content` slice of the store (see
`DATA_MODEL.md`). This pins the **actual, current shape** of `src/data/*.json`
— which today is a thinner "metadata stub" than the full interfaces sketched
in `DATA_MODEL.md` — plus a simple leveling convention and a solo-hobby-scoped
authoring workflow.

> **v1 constraint:** no CMS, no build step, no backend. Content is hand-edited
> JSON committed to the repo, read at runtime via `src/data/*.json` imports.

---

## 1. Content-item schema per feature

Every item has a **common base**, matching `ContentItemBase` in
`DATA_MODEL.md`:

```ts
interface ContentItemBase {
  id: string;        // "{category}:{slug}", globally unique, kebab-case slug
  category: CategoryId; // "bookworm" | "quiz" | "grammar" | "listening" | "speaking"
  title: string;
  level: 1 | 2 | 3;   // difficulty badge, see §2
}
```

Per-feature extra fields below reflect what's **actually in the JSON today**
(`src/data/*.json`). Fields marked **(not yet authored)** are part of the
target `DATA_MODEL.md` shape but no item currently has them — see §4 for why
that matters before feature views ship.

### Book worm — `src/data/bookworm.json`

```ts
interface BookPassage extends ContentItemBase {
  category: "bookworm";
  estReadSeconds: number;
  body: string;              // (not yet authored) passage text
  questions: MCQuestion[];   // (not yet authored) comprehension check, 3–5 items
}
```

Current example:
```json
{ "id": "bookworm:the-lantern", "category": "bookworm", "title": "The Lantern", "level": 1, "estReadSeconds": 180 }
```

### Pop up Quiz! — `src/data/quiz.json`

```ts
interface QuizRound extends ContentItemBase {
  category: "quiz";
  perQuestionSeconds: number;
  questions: MCQuestion[];   // (not yet authored) 5–10 items pulled as a bank/round
}
```

Current example:
```json
{ "id": "quiz:vocab-1", "category": "quiz", "title": "Vocabulary Round I", "level": 1, "perQuestionSeconds": 10 }
```

> Note: today's items read as **quiz sets/rounds** (a "Vocabulary Round"), so
> `DATA_MODEL.md` now models this as `QuizRound { questions: MCQuestion[] }`
> (renamed from `QuizQuestion { question }`) to match the "pull N random
> questions" flow in `FEATURES.md` and the "Round I / Round II" titles already
> chosen in the content. The rename has been applied to `DATA_MODEL.md`.

### Grammar — `src/data/grammar.json`

```ts
interface GrammarTopic extends ContentItemBase {
  category: "grammar";
  order: number;              // unlock sequence, 1-based, matches list order
  masteryThreshold: number;   // % to mark complete (currently 70 for all)
  lesson: { explanation: string; examples: string[] }; // (not yet authored)
  drills: GrammarExercise[];  // (not yet authored)
}
```

Current example:
```json
{ "id": "grammar:present-simple", "category": "grammar", "title": "Present Simple", "level": 1, "order": 1, "masteryThreshold": 70 }
```

`GrammarExercise` shapes (from `DATA_MODEL.md`, unchanged):
```ts
type GrammarExercise =
  | { kind: "fill-blank"; id: string; sentence: string; answer: string; hint?: string }
  | { kind: "multiple-choice"; id: string; question: MCQuestion }
  | { kind: "reorder"; id: string; tokens: string[]; correctOrder: number[] };
```

### Listening — `src/data/listening.json`

```ts
interface ListeningClip extends ContentItemBase {
  category: "listening";
  durationSeconds: number;
  audioSrc: string;           // (not yet authored) path under public/audio/, see AUDIO_ASSETS_AND_MEDIA.md
  transcript: string;         // (not yet authored) hidden by default in Player
  questions: MCQuestion[];    // (not yet authored) comprehension check
}
```

Current example:
```json
{ "id": "listening:cafe-order", "category": "listening", "title": "Ordering at a Cafe", "level": 1, "durationSeconds": 45 }
```

`public/audio/` does not exist yet in the repo — creating clips (recording
or generating audio + writing `audioSrc`/`transcript`/`questions`) is a
prerequisite for building the Listening feature view. See
`AUDIO_ASSETS_AND_MEDIA.md` for the folder layout, naming convention, and
sourcing options.

### Speaking — `src/data/speaking.json`

```ts
interface SpeakingPrompt extends ContentItemBase {
  category: "speaking";
  targetText: string;
  referenceAudioSrc?: string; // optional model pronunciation, path under public/audio/, see AUDIO_ASSETS_AND_MEDIA.md
}
```

Current example:
```json
{ "id": "speaking:greetings", "category": "speaking", "title": "Greetings", "level": 1, "targetText": "Good morning! How are you today?" }
```

Speaking is the one feature whose JSON is already **complete** for v1 —
`targetText` is all the Practice view needs; `referenceAudioSrc` is optional
and can be omitted.

### Shared question/exercise shape

```ts
interface MCQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}
```

Unchanged from `DATA_MODEL.md` — use this exact shape everywhere a
multiple-choice question appears (bookworm comprehension, quiz, listening
comprehension, grammar `multiple-choice` drills).

---

## 2. Difficulty / level tagging & XP mapping

### Level badge (`level: 1 | 2 | 3`)

A simple, coarse difficulty tag shown as a badge on list/card views. No
sub-levels or numeric scoring in v1 — pick the closest bucket:

| Level | Meaning | Rough guidance |
|---|---|---|
| 1 | Beginner | Short passages/clips (~45–210s), common vocab, single-clause grammar, everyday greetings |
| 2 | Intermediate | Medium length (~240–300s), mixed vocab, multi-clause grammar, situational dialogue |
| 3 | Advanced | Longer/denser content, idiomatic language, compound grammar rules |

Current spread across content (for calibration when adding items): most items
are `1`–`2`; only Grammar's `comparatives` topic is `3`. Keep new content
roughly balanced across levels 1–2, with `3` reserved for genuinely harder
material — don't let level drift into a per-item difficulty slider.

`level` is purely a **display badge** — it does not currently gate anything
in the store logic. Grammar's `order` field is what drives real unlock
sequencing (see below); `level` and `order` may move independently (e.g. a
level-1 topic could still be ordered after a level-2 topic if it's
conceptually a prerequisite).

### Category → XP tiers

XP awarded on completion is a **feature-level** formula from `GAMIFICATION.md`,
not a per-item field — don't add an `xpReward` field to content items. Base +
bonus by feature:

| Feature | Base XP | Bonus |
|---|---|---|
| Book worm | 20 | up to 15 for comprehension score + reading-time bonus |
| Pop up Quiz! | 5 per correct | up to 10 speed bonus |
| Grammar | 25 | mastery bonus |
| Listening | 20 | comprehension score bonus |
| Speaking | 15 | 5/10/15 for 1★/2★/3★ self-rating |

When authoring new content, you don't set XP per item — the feature's
completion handler (calling `recordCompletion` in `src/stores/app.js`) applies
this formula uniformly. The only place a difficulty-to-reward link would make
sense is a **future** per-level XP multiplier (e.g. level 3 = 1.2× base) —
explicitly out of scope for v1; flag it in `GAMIFICATION.md` if it's wanted
later rather than inventing an ad hoc field now.

### Achievements

`xpReward` on `Achievement` records (in `src/data/achievements.json`) is a
flat `25` for every entry today, regardless of `rarity`. If you add a new
achievement, match the existing flat-25 convention unless you deliberately
want to introduce a rarity-scaled reward — if so, update all existing rows
together so the scheme stays consistent, and note the change here.

---

## 3. Workflow for adding new content

Scoped for a solo hobby project — no CMS, no content build step, no schema
validation tooling. Just JSON + a manual checklist.

### Where files live

| Content type | File |
|---|---|
| Book passages | `src/data/bookworm.json` |
| Quiz rounds | `src/data/quiz.json` |
| Grammar topics | `src/data/grammar.json` |
| Listening clips | `src/data/listening.json` |
| Speaking prompts | `src/data/speaking.json` |
| Achievement definitions | `src/data/achievements.json` |
| Category metadata (rarely changes) | `src/data/categories.json` |
| Audio assets | `public/audio/` (create this folder when the first clip/reference is added — see `AUDIO_ASSETS_AND_MEDIA.md`) |

### Naming convention

- **id**: `"{category}:{kebab-case-slug}"`, e.g. `bookworm:the-lantern`,
  `grammar:present-simple`, `speaking:ordering-food`. The slug should be short,
  human-readable, and stable once shipped (it's the join key for
  `ProgressRecord.itemId` — never rename an existing id, only add new ones).
- **Nested ids** (`MCQuestion.id`, `GrammarExercise.id`): scope them under the
  parent, e.g. `bookworm:the-lantern:q1`, `grammar:articles:drill-3`, so they
  stay unique and greppable across the whole content set.
- **Audio files**: `public/audio/{category}/{slug}.mp3` (e.g.
  `public/audio/listening/cafe-order.mp3`,
  `public/audio/speaking/greetings-ref.mp3`) — full convention and rationale
  (why `public/` and not `src/assets/`) in `AUDIO_ASSETS_AND_MEDIA.md`.

### Steps to add a new item

1. Pick the target JSON file and append a new object at the end of the array
   (keep existing items untouched — order matters for Grammar's `order`
   field, everything else is display order only).
2. Fill the full schema for that feature (§1) — including the "(not yet
   authored)" fields like `body`, `questions`, `lesson`/`drills`, `audioSrc`/
   `transcript`. Don't ship a stub-only entry once feature views are live;
   stubs were only acceptable while views were placeholders.
3. Assign `id` (unique, kebab-case, never reused), `level` (§2), and — for
   Grammar — the next sequential `order`.
4. If the item needs audio, drop the file under `public/audio/` using the
   naming convention above and reference it by its site-root-relative path
   (e.g. `"/audio/listening/cafe-order.mp3"`) per `AUDIO_ASSETS_AND_MEDIA.md`
   — not a `src/assets/` import.
5. Run the manual validation checklist below.
6. Commit the JSON (and any new asset files) together in one change.

### Manual validation checklist

Before committing new/edited content, check by hand:

- [ ] `id` is unique across the whole file (and doesn't collide with any other
      category's ids — grep `src/data/` for the exact string).
- [ ] `id` follows `{category}:{slug}` and `category` field matches the file's
      category exactly (e.g. no `"category": "quiz"` inside `bookworm.json`).
- [ ] `level` is `1`, `2`, or `3` (no strings, no other numbers).
- [ ] JSON is valid — run it through a formatter/linter or just open it in an
      editor with JSON validation; a trailing comma or missing bracket will
      break the whole content bundle for that feature.
- [ ] Every `MCQuestion.correctIndex` is a valid index into that question's
      `options` array (0-based, within bounds).
- [ ] Every `GrammarExercise` of kind `reorder` has `correctOrder` as a valid
      permutation of indices into `tokens` (same length, no duplicates/gaps).
- [ ] Grammar topics: `order` values are sequential integers with no gaps or
      duplicates across the whole file.
- [ ] Listening/Speaking audio paths (`audioSrc`, `referenceAudioSrc`) point
      to a file that actually exists under `public/audio/`.
- [ ] Text content (passages, prompts, questions) is free of typos and
      appropriate for the target reading/listening level.
- [ ] After editing, load the relevant feature view locally (once built) and
      confirm the new item renders and can be completed end-to-end.

---

## 4. Inconsistencies found (to reconcile)

These are gaps between `FEATURES.md` / `DATA_MODEL.md` and what's actually in
`src/data/*.json` today. Flagging them here rather than silently "fixing" the
docs, since the real fix requires authoring actual content, not just editing
markdown:

1. **Missing content bodies.** `DATA_MODEL.md`'s interfaces (`BookPassage`,
   `QuizQuestion`, `GrammarTopic`, `ListeningClip`) all include the actual
   learning content — passage `body`, `questions`, `lesson`/`drills`,
   `audioSrc`/`transcript`/`questions` — but none of the current JSON files
   have these fields. Today's files are **metadata-only stubs** (id, title,
   level, and one timing/sequence field). This is fine while feature views are
   `PlaceholderView.vue`, but every feature build will need real content
   authored before it can work — this doc's §1 flags exactly which fields are
   missing per feature so authoring can start immediately.

2. **Quiz item = round, not single question — fixed.** `DATA_MODEL.md`
   previously named the type `QuizQuestion` with a single `question:
   MCQuestion` field, but `FEATURES.md` describes "pull N random questions
   from a mixed bank" and the current data (`quiz:vocab-1` titled "Vocabulary
   Round I") reads as a multi-question round/bank. `DATA_MODEL.md` has been
   updated to `QuizRound { questions: MCQuestion[] }` to match.

3. **Audio location: `public/audio/`, not `src/assets/audio/`.**
   `DATA_MODEL.md` and `FEATURES.md` both assume audio files are bundled under
   `src/assets/`, but `AUDIO_ASSETS_AND_MEDIA.md` deliberately overrides this
   to `public/audio/` (Vite hashes/inlines `src/assets/` imports, which is the
   wrong tradeoff for stable, JSON-referenced audio paths). This doc's §1 and
   §3 already use the corrected `public/audio/` path — no such folder exists
   yet in the repo (only `src/assets/bg/`, `icons/`, `sprites/`, `main.css`),
   and it needs creating before any Listening/Speaking audio is authored.

4. **Uniform achievement `xpReward`.** `GAMIFICATION.md` describes rarity
   (`common | rare | epic`) as if it might scale reward size, but every
   achievement in `achievements.json` currently has `xpReward: 25` regardless
   of rarity. Not a bug — just worth knowing rarity is currently cosmetic
   (badge tier/color) rather than reward-scaling. Documented in §2 above as the
   current convention to follow.

5. **`level` field doesn't gate anything.** Both docs treat `level` as a
   simple display badge, but it's worth being explicit (added in §2) that only
   Grammar's `order` field drives real unlock sequencing — `level` never
   blocks access to content in v1, avoiding confusion when authoring a level-3
   item that should still be freely selectable.
