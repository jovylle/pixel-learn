# pixel-learn — Data Model (v1, mock / no backend)

Schema for the **no-backend v1**. All state lives in a client store (Pinia or a
plain reactive module) hydrated from and persisted to `localStorage`. Static
**content** (passages, quiz banks, drills, clips, prompts) is bundled as JSON in
`src/data/` and is read-only; **user state** (progress, XP, activity) is the
only mutable, persisted part.

> Types below are TypeScript-ish interfaces for clarity — not a DB design. No
> auth, no users table, no server. There is exactly **one local user** in v1.

## Storage layout

| localStorage key | Holds |
|---|---|
| `pixel-learn:user` | The single `User` object (profile + stats + xp + streak) |
| `pixel-learn:progress` | `ProgressRecord[]` (one per content item touched) |
| `pixel-learn:achievements` | `Achievement[]` unlock state (or just unlocked ids) |
| `pixel-learn:activity` | `ActivityLogEntry[]` (trimmed to ~100 latest) |
| `pixel-learn:schemaVersion` | integer, for future migrations |

Content JSON (`src/data/*.json`) is **not** stored in localStorage — it's part
of the bundle.

---

## User / Profile

```ts
interface User {
  id: string;                 // fixed local id, e.g. "local-user"
  username: string;           // shown in navbar + Hero ("Welcome back, {username}!")
  displayName: string;
  avatarSeed: string;         // DiceBear pixel-art seed (see PLAN.md avatar options)
  xp: number;                 // cumulative; level derived from this
  streak: Streak;
  stats: UserStats;
  createdAt: string;          // ISO
}

interface UserStats {
  readingSeconds: number;     // -> dashboard "Reading Time" (shown as hours)
  // "Lessons" and "Achievements" counts are DERIVED, not stored:
  //   lessons      = count(ProgressRecord.status === "complete")
  //   achievements = count(Achievement.unlockedAt != null)
}

interface Streak {
  current: number;
  longest: number;
  lastActiveDate: string;     // ISO date (YYYY-MM-DD), local
}
```

Derived (computed, never persisted): `level`, `xpIntoLevel`, `percentCompleted`,
`lessonsCount`, `achievementsCount`. See `GAMIFICATION.md` for formulas.

---

## Category & content items

`Category` is a fixed enum matching the dashboard pills.

```ts
type CategoryId =
  | "bookworm" | "quiz" | "grammar" | "listening" | "speaking";

interface Category {
  id: CategoryId;
  label: string;              // "Book worm", "Pop up Quiz!", etc.
  icon: string;               // pixel icon key
  route: string;              // see ROUTES_AND_COMPONENTS.md
}
```

Each feature has its own content-item shape (all read-only, bundled). They share
a common base so progress can reference any of them uniformly:

```ts
interface ContentItemBase {
  id: string;                 // globally unique, e.g. "bookworm:the-lantern"
  category: CategoryId;
  title: string;
  level: 1 | 2 | 3;           // difficulty badge
}

interface BookPassage extends ContentItemBase {
  category: "bookworm";
  body: string;               // passage text
  estReadSeconds: number;
  questions: MCQuestion[];    // comprehension check
}

interface QuizQuestion extends ContentItemBase {
  category: "quiz";
  question: MCQuestion;
  perQuestionSeconds: number;
}

interface GrammarTopic extends ContentItemBase {
  category: "grammar";
  order: number;              // unlock sequence
  lesson: { explanation: string; examples: string[] };
  drills: GrammarExercise[];
  masteryThreshold: number;   // % to mark complete
}

interface ListeningClip extends ContentItemBase {
  category: "listening";
  audioSrc: string;           // path in src/assets/audio/
  durationSeconds: number;
  transcript: string;         // hidden by default
  questions: MCQuestion[];
}

interface SpeakingPrompt extends ContentItemBase {
  category: "speaking";
  targetText: string;
  referenceAudioSrc?: string; // optional model pronunciation
}
```

Shared exercise/question shapes:

```ts
interface MCQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

type GrammarExercise =
  | { kind: "fill-blank"; id: string; sentence: string; answer: string; hint?: string }
  | { kind: "multiple-choice"; id: string; question: MCQuestion }
  | { kind: "reorder"; id: string; tokens: string[]; correctOrder: number[] };
```

---

## ProgressRecord

One per content item the user has started or finished. This is the source of
truth for completion, scores, and the Progress bar.

```ts
interface ProgressRecord {
  itemId: string;             // -> ContentItemBase.id
  category: CategoryId;
  status: "in-progress" | "complete";
  bestScore?: number;         // 0-100 (comprehension %, quiz %, mastery %)
  selfScore?: 1 | 2 | 3;      // speaking self-rating only
  attempts: number;
  startedAt: string;          // ISO
  updatedAt: string;          // ISO
  completedAt?: string;       // ISO, set when status -> complete
}
```

Rules:
- Keyed by `itemId` (upsert, not append).
- `bestScore` never decreases on re-attempt.
- `completedItems` for the progress bar = records with `status === "complete"`.

---

## Achievement

```ts
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;               // gold pixel icon key
  rarity: "common" | "rare" | "epic";
  xpReward: number;
  unlockedAt: string | null;  // ISO when earned, null while locked
}
```

Definitions ship static in `src/data/achievements.json` (locked, `unlockedAt:
null`); only the unlocked ids + timestamps are persisted. Trigger conditions
live in code as predicates (see `GAMIFICATION.md`), not in the JSON.

---

## ActivityLogEntry

Feeds the **Recent Activity** card.

```ts
interface ActivityLogEntry {
  id: string;                 // uuid / nanoid
  type:
    | "lesson-complete"       // any feature completion
    | "level-up"
    | "achievement"
    | "streak-milestone";
  category?: CategoryId;      // for lesson-complete
  message: string;            // "Finished reading The Lantern"
  icon: string;               // pixel icon key (per type/category)
  xpEarned?: number;
  createdAt: string;          // ISO
}
```

Rules: append on every completion / level-up / unlock / streak milestone;
render latest 8–10 on the dashboard; trim persisted array to ~100.

---

## Store shape (in-memory, reactive)

```ts
interface AppState {
  user: User;
  content: {                  // hydrated from bundled JSON (read-only)
    categories: Category[];
    bookworm: BookPassage[];
    quiz: QuizQuestion[];
    grammar: GrammarTopic[];
    listening: ListeningClip[];
    speaking: SpeakingPrompt[];
  };
  progress: ProgressRecord[]; // persisted
  achievements: Achievement[];// persisted (unlock state)
  activity: ActivityLogEntry[];// persisted
}
```

### Seeding & reset
- On first load (no `pixel-learn:user`): create a default `User`
  (`username: "urbano"` to match the PLAN.md reference, `xp: 0`, empty streak),
  seed `achievements` from JSON (all locked), empty `progress` / `activity`.
- Provide a dev-only **"Reset progress"** action (also useful in Profile/
  Settings) that clears the mutable keys and re-seeds.

> **Future / out of scope for v1:** multiple user accounts, auth, server sync,
> content authored via a CMS, remote content fetch. All content and state are
> local and bundled in v1.
