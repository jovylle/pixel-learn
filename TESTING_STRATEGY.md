# pixel-learn — Testing Strategy

`ONBOARDING_AND_POLISH.md` §4 already scoped testing down to "pure
gamification functions only." This doc expands that now that the five
feature routes (Book worm, Pop up Quiz!, Grammar, Listening, Speaking) are
moving from placeholder to real implementations with shared components
(`CompletionScreen.vue`, `MCQuestionCard.vue` per `ROUTES_AND_COMPONENTS.md`)
— enough surface area that "what's worth testing" needs an actual answer, not
just a table of four functions.

> **v1 constraint:** same as everywhere else — solo hobby project, no
> backend, keep it simple. Nothing here should slow down shipping features.

## 1. Unit test scope — pure logic + store actions

### `src/lib/gamification.js` (unchanged from `ONBOARDING_AND_POLISH.md` §4)
Still the highest-value target: plain exported functions, no Vue/Pinia
imports, easy to get subtly wrong, easy to test against plain objects.

| Function | Why it's worth a test |
|---|---|
| `xpForLevel(L)` / `levelFromXp(xp)` | Off-by-one errors are easy and silently wrong for a long time |
| `nextStreakState` (`same day` / `+1` / `reset`) | Date-boundary logic, classic source of bugs |
| `streakMilestoneHit` | Exact-match milestone list — easy to break with a `>=` vs `===` slip |
| `evaluateAchievements(ctx)` | Growing predicate list (`ACHIEVEMENT_PREDICATES`) — a regression here silently stops awarding badges. Test each predicate that has real logic (`first_steps`, `bookworm_5`, `quiz_perfect`, `grammar_guardian`, `good_ear`, `silver_tongue`, `streak_7`/`streak_30`, `level_10`, `all_rounder`, `night_owl`); skip `speed_demon` since it's a documented always-`false` stub |
| `percentCompleted` | Simple, but feeds the dashboard's headline number |
| `getSlimeLine` | Pure priority-ordering logic (level-up > achievement > streak > returning > normal > empty) — cheap to test all six branches |

### `src/stores/app.js` — the actions that now matter
Now that `recordCompletion` is the real write path every feature calls (not
a stub), it's worth testing at the store level too, because it's where
gamification formulas + persistence + achievement evaluation are wired
together — bugs in the *wiring* won't show up in `gamification.js`'s
pure-function tests even if every formula is individually correct.

| Store action/getter | Why it's worth a test |
|---|---|
| `recordCompletion` | The shared completion contract every feature module calls (per `FEATURES.md`) — verify it upserts the right `progress` record, awards XP, updates streak, and triggers achievement eval, using an in-memory/mock `localStorage` |
| `runAchievementEval` | Confirms newly-unlocked achievements get `unlockedAt` set, log an activity entry, and award their `xpReward` — the glue around `evaluateAchievements` |
| `awardXp` / level-up activity logging | Confirms crossing a level boundary logs one `level-up` activity per level crossed (not zero, not double) |
| `touchStreak` | Confirms milestone activity logging matches `streakMilestoneHit` |
| `levelInfo` / `percentCompletedValue` computed getters | Thin wrappers over the pure functions above, but worth a smoke test since they're what the UI actually reads |

To test the store in isolation, mount it with `setActivePinia(createPinia())`
in each test and either stub `localStorage` (jsdom provides a real one) or
just let it write/read through jsdom's `localStorage` and clear it between
tests. No need to mock Pinia itself.

**Not worth testing:** `createUser`, `resetProgress`, `seedDemoData` — these
are straightforward object resets/seed data with no formula logic; a typo
would be caught immediately by manual testing (seed data literally renders
on the dashboard).

## 2. Component test scope

Most of the app is presentation over the store — not worth heavy investment,
per the existing "keep it simple" philosophy. But the two **shared**
components called out in `ROUTES_AND_COMPONENTS.md`'s Notes section are
worth testing precisely *because* they're shared: a bug in either one breaks
multiple features at once, not just one screen.

| Component | What to check |
|---|---|
| `MCQuestionCard.vue` | Renders all answer options; clicking an option emits the expected event (e.g. `answer` with the selected value); selected/correct/incorrect visual *state* is applied to the right option (check a class/attr is present, not what it looks like); disabled state after answering (no double-submit) |
| `CompletionScreen.vue` | Renders XP/streak/achievement-unlocked props correctly for a few prop combinations (e.g. with vs. without a newly unlocked achievement); "next item" link/button emits or navigates as expected |

For the five feature views (`BookwormReaderView`, `QuizView`,
`GrammarLessonView`, `ListeningClipView`, `SpeakingPracticeView`), skip
full component tests in v1. They're mostly internal-step state machines
(`intro | playing | results`, etc.) built from the shared/list components
above — the interesting logic (scoring, XP, streak, achievements) already
lives in `gamification.js`/`app.js` and is tested there. If a view *does*
grow real branching logic of its own later (e.g. `SpeakingPracticeView`'s
mic-permission-denied fallback per `FEATURES.md`), test that one specific
behavior in isolation rather than mounting the whole view — that's the one
case in the current plan risky enough to be worth it (permission APIs are
easy to leave untested and then discover broken in a real recording).

In all cases: assert on **rendered states and emitted events**, never on
pixel-level layout/appearance — that's what "not visual pixel-perfection"
means here, and it's what keeps these tests cheap to maintain as the pixel
styling gets tweaked.

## 3. Tooling

**Vitest + `@vue/test-utils` + jsdom.** Vitest because it already pairs
naturally with Vite (per `ONBOARDING_AND_POLISH.md` §4, and confirmed
here — no separate config system, same `vite.config.js` resolve aliases
like `@/` apply for free); `@vue/test-utils` is the only realistic choice
for mounting Vue 3 SFCs; jsdom (Vitest's default `environment`) is enough
DOM to test the two shared components above and exercise `localStorage` for
store tests — no real browser needed. No alternative (Jest, Cypress
component testing, Playwright component testing) is a better fit for a
project this size; they'd add config/runtime overhead for the same coverage.

Not implementing this now, but the actual setup would be:
- **`package.json`**: add `vitest`, `@vue/test-utils`, and `jsdom` to
  `devDependencies`; add a `"test": "vitest run"` script (and optionally
  `"test:watch": "vitest"` for local dev).
- **`vite.config.js`** (or a separate `vitest.config.js`): add a `test`
  block with `environment: 'jsdom'` and reuse the existing `resolve.alias`
  for `@/` so test files can import the same way app code does.
- No `setupFiles`/global mocks needed yet — jsdom's built-in `localStorage`
  and `crypto.randomUUID` are sufficient for the store tests above.

## 4. Non-goals for v1

Matches the project's existing "v1, no backend, keep it simple" philosophy
— explicitly **not** doing any of the following:

- **No E2E testing** (Playwright/Cypress). There's no backend and only one
  local user; a full browser-driven test suite is disproportionate to a
  solo hobby project's risk profile.
- **No visual regression testing.** The pixel-art styling is expected to
  keep shifting; screenshot-diffing it would generate constant noise for no
  real bug-catching benefit — already ruled out in `ONBOARDING_AND_POLISH.md`
  §4 and reaffirmed here for the component-test layer too.
- **No CI test-gating requirement.** There's no CI pipeline in this project
  yet, and adding a mandatory "tests must pass to merge" gate isn't worth
  the setup for a single-contributor repo. If a CI workflow gets added later
  for other reasons (deploy automation, etc.), running `npm test` in it is a
  trivial addition worth doing then — just not a reason to set up CI now.
- **No coverage thresholds/reporting.** Coverage numbers would optimize for
  the wrong thing here (testing presentational components no one asked for)
  rather than the actual goal of protecting the gamification formulas.

## 5. File/naming convention

**Co-located `*.spec.js` files next to the code they test**, e.g.:
```
src/lib/gamification.js
src/lib/gamification.spec.js
src/stores/app.js
src/stores/app.spec.js
src/components/ui/MCQuestionCard.vue
src/components/ui/MCQuestionCard.spec.js
```

Rationale: this is a small codebase with a handful of test files, not a
large suite that benefits from a mirrored top-level `tests/` tree. Co-location
keeps a test next to the module it exercises so it's obvious at a glance
whether something has coverage, and it's a single move/rename away from
staying in sync if a file gets relocated — a top-level `tests/` directory
would just be extra indirection for no benefit at this scale. Vitest picks up
`*.spec.js` (and `*.test.js`) anywhere in the project by default, so no glob
config is needed either way.
