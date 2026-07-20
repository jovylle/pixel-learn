# pixel-learn — Routes & Component Tree

Page/route list and per-page Vue component breakdown. Reuses the panel/card
visual language, palette, and fonts from `PLAN.md`. Uses **Vue Router**; all
data comes from the mock store (`DATA_MODEL.md`).

> **v1 constraint:** no backend. Routes are client-side only; no auth guards
> (the single local user is always "logged in").

## Route table

| Path | Name | Feature | Notes |
|---|---|---|---|
| `/` | `dashboard` | — | The main screen from PLAN.md |
| `/bookworm` | `bookworm-library` | Book worm | Library grid |
| `/bookworm/:id` | `bookworm-reader` | Book worm | Reader + comprehension |
| `/quiz` | `quiz` | Pop up Quiz! | Intro → questions → results (single route, internal steps) |
| `/grammar` | `grammar-topics` | Grammar | Topic list (with lock state) |
| `/grammar/:id` | `grammar-lesson` | Grammar | Lesson card → drill |
| `/listening` | `listening-list` | Listening | Clip list |
| `/listening/:id` | `listening-clip` | Listening | Player → comprehension |
| `/speaking` | `speaking-list` | Speaking | Prompt list |
| `/speaking/:id` | `speaking-practice` | Speaking | Record + self-assess |
| `/achievements` | `achievements` | — | Full badge grid (dashboard shows count only) |
| `/profile` | `profile` | — | Profile + Settings (see `NAVBAR_AND_PROFILE.md`) |
| `/:catchAll(.*)` | `not-found` | — | Pixel 404 panel |

The five feature "flows" (intro/steps/results) are handled as **internal state
inside one route component** rather than sub-routes, so a refresh mid-quiz just
restarts that quest cleanly — simplest correct behavior for v1.

---

## Shared / global components

Reused everywhere; encode the PLAN.md visual language once.

```
App.vue
├─ PixelBackground.vue      // fixed fullscreen parallax (castle+forest+moon+stars)
├─ TheNavbar.vue            // hamburger, logo, avatar dropdown (NAVBAR_AND_PROFILE.md)
│  ├─ HamburgerMenu.vue
│  └─ UserMenu.vue
├─ <RouterView/>            // page content sits above the background
└─ CelebrationOverlay.vue   // level-up / achievement popup (global, store-driven)
```

**Design-system primitives** (`src/components/ui/`) — the panel/card language:

| Component | Purpose |
|---|---|
| `PixelPanel.vue` | The base card: `panel-bg` @ ~87% opacity, 1–2px `panel-border`, 4–6px pixel corners, no blur (per PLAN.md) |
| `PixelButton.vue` | Pill/rect button, `panel-border` outline → `accent-blue` on hover |
| `PixelProgressBar.vue` | `progress-track` track + `accent-blue` fill, pixel style |
| `PixelIcon.vue` | Renders a pixel icon by key (book, clock, trophy, headphones, mic, star, scroll, speech-bubble) |
| `StatCard.vue` | Icon + label (`accent-blue`) + big number (`text-primary`) |
| `CategoryPill.vue` | Icon + label pill used in the dashboard categories row + nav |
| `SlimeNPC.vue` | Slime sprite + speech bubble, line chosen from store state |
| `CharacterSprite.vue` | Student-reading sprite for the Hero card |
| `EmptyState.vue` | Shared empty panel ("No activity yet", "Shelf empty", etc.) |
| `LoadingPanel.vue` | Shared loading state |
| `LevelBadge.vue` | Small level chip |

Feature list/step components lean on these so every screen inherits the theme.

---

## Page component trees

### Dashboard (`/`) — mirrors PLAN.md layout
```
DashboardView.vue
├─ HeroCard.vue                (PixelPanel)
│  ├─ welcome text ("Welcome back, {username}!" — name in accent-blue)
│  └─ CharacterSprite
├─ ProgressCard.vue            (PixelPanel)
│  └─ PixelProgressBar + "{n}% Completed"
├─ StatsRow.vue
│  ├─ StatCard  (Lessons, book icon)
│  ├─ StatCard  (Reading Time, clock icon)
│  └─ StatCard  (Achievements, trophy icon)
├─ LearningCategoriesCard.vue  (PixelPanel)
│  └─ CategoryPill × 5  (Book worm, Pop up Quiz!, Grammar, Listening, Speaking → router links)
└─ RecentActivityCard.vue      (PixelPanel)
   ├─ ActivityList.vue → ActivityItem.vue × n  (or EmptyState)
   └─ SlimeNPC
```

### Book worm library (`/bookworm`)
```
BookwormLibraryView.vue
├─ PageHeader.vue  (title + back-to-dashboard)
└─ BookGrid.vue → BookCard.vue × n  (cover, level, est. time, complete ✓)
```

### Book worm reader (`/bookworm/:id`)
```
BookwormReaderView.vue
├─ PassageReader.vue   (parchment PixelPanel, font-size toggle, reading-time tracker, "I'm done")
├─ ComprehensionQuiz.vue → MCQuestionCard.vue × n
└─ CompletionScreen.vue (XP gained, streak, SlimeNPC, "next book")
```

### Quiz (`/quiz`)
```
QuizView.vue  (holds step state: intro | playing | results)
├─ QuizIntro.vue
├─ QuizPlayer.vue
│  ├─ QuestionTimerRing.vue
│  └─ MCQuestionCard.vue
└─ QuizResults.vue  (score, fastest, streak, XP → CompletionScreen)
```

### Grammar topics (`/grammar`) & lesson (`/grammar/:id`)
```
GrammarTopicsView.vue
├─ PageHeader
└─ TopicList.vue → TopicCard.vue × n  (lock/complete + mastery bar)

GrammarLessonView.vue  (step: lesson | drill | complete)
├─ LessonCard.vue
├─ DrillRunner.vue
│  ├─ FillBlankExercise.vue
│  ├─ MultipleChoiceExercise.vue   (wraps MCQuestionCard)
│  └─ ReorderExercise.vue          (drag word tiles)
└─ CompletionScreen.vue
```

### Listening list (`/listening`) & clip (`/listening/:id`)
```
ListeningListView.vue
├─ PageHeader
└─ ClipList.vue → ClipCard.vue × n

ListeningClipView.vue  (step: player | comprehension | complete)
├─ PixelAudioPlayer.vue  (play/pause, scrubber, replay, speed, transcript toggle)
├─ ComprehensionQuiz.vue → MCQuestionCard.vue × n
└─ CompletionScreen.vue
```

### Speaking list (`/speaking`) & practice (`/speaking/:id`)
```
SpeakingListView.vue
├─ PageHeader
└─ PromptList.vue → PromptCard.vue × n

SpeakingPracticeView.vue  (step: idle | recording | recorded | complete)
├─ TargetSentence.vue      (+ optional reference audio button)
├─ MicRecorder.vue         (MediaRecorder; handles permission-denied fallback)
├─ RecordingPlayback.vue
├─ SelfScore.vue           (1–3 stars)
└─ CompletionScreen.vue
```

### Achievements (`/achievements`)
```
AchievementsView.vue
├─ PageHeader  (unlocked count / total)
└─ AchievementGrid.vue → AchievementBadge.vue × n  (locked = greyed, rarity color)
```

### Profile / Settings (`/profile`)
See `NAVBAR_AND_PROFILE.md` for contents.
```
ProfileView.vue
├─ ProfileCard.vue    (avatar, username, level, XP bar, streak, totals)
└─ SettingsPanel.vue  (username edit, avatar seed, font-size default, reset progress)
```

### Not found (`/:catchAll`)
```
NotFoundView.vue  (PixelPanel "404 — lost in the dungeon", back-to-dashboard button, SlimeNPC)
```

---

## Notes
- **`CompletionScreen.vue` is shared** across all five features (props: xp,
  streak, achievements unlocked, next-item link) — keeps the reward UX uniform,
  matching the shared feature contract in `FEATURES.md`.
- **`MCQuestionCard.vue` is shared** across Book worm, Quiz, Grammar (MC), and
  Listening — one multiple-choice UI everywhere.
- Every page renders above the single fixed `PixelBackground` — pages never
  re-declare the background.
