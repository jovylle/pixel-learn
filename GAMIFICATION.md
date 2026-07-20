# pixel-learn — Gamification Systems

The systems implied by the dashboard's **Progress bar**, **Achievements** stat,
XP, **% Completed**, and **Recent Activity** card — plus how the pixel character
and slime NPC react to progress. All mock/local per v1 (see `DATA_MODEL.md`).

> **v1 constraint:** everything here is computed client-side from `localStorage`.
> No server, no real leaderboards, no cross-device sync.

## 1. XP & Leveling

XP is the single currency earned from completing any feature activity.

### Earning XP
| Source | XP |
|---|---|
| Complete a Book worm passage | 20 base + up to 15 for comprehension score + reading-time bonus |
| Pop up Quiz! | 5 per correct + speed bonus (up to 10) |
| Grammar topic drill | 25 base + mastery bonus |
| Listening clip | 20 base + comprehension score bonus |
| Speaking prompt | 15 base + self-rating bonus (5 / 10 / 15 for 1★/2★/3★) |
| Daily streak bonus | +10 for the day's first completed activity |
| Achievement unlock | +25 (varies by rarity, see below) |

### Level curve
Simple escalating threshold. Level `L` requires cumulative XP:

```
xpForLevel(L) = 100 * L * (L + 1) / 2      // L1→100, L2→300, L3→600, L4→1000...
```

- Store raw cumulative `User.xp`; derive `level` and `xpIntoLevel` on read.
- **Level-up** triggers a celebration overlay + slime NPC reaction (below) and
  an `ActivityLogEntry` ("Reached Level {n}!").

## 2. "% Completed" (Progress bar)

The dashboard progress bar reflects **overall course completion**, not XP.

```
percentCompleted = round( completedItems / totalItems * 100 )
```

- `totalItems` = count of all bundled content items across the five features
  (books + quiz milestones + grammar topics + listening clips + speaking
  prompts). Defined by the static content, known at build time.
- `completedItems` = count of `ProgressRecord`s with `status === "complete"`.
- Distinct from **Level** (XP-driven). Two separate signals: *how much of the
  course you've finished* (progress bar) vs. *how much you've practiced* (level).

## 3. Streaks

Encourages daily return; drives Pop up Quiz! and daily-bonus logic.

- `streak.current` = consecutive days with ≥ 1 completed activity.
- `streak.longest` = best ever.
- On each completion: compare today vs. `streak.lastActiveDate`.
  - Same day → no change.
  - Exactly yesterday → `current += 1`.
  - Gap > 1 day → `current = 1` (reset), keep `longest`.
- Streak milestones (3, 7, 14, 30 days) unlock achievements + trigger a slime
  cheer.

> **Future / out of scope for v1:** streak-freeze / "repair" items, timezone-
> aware server enforcement. v1 uses local device date only.

## 4. Achievements

Badges shown in the **Achievements** stat (count) and a future Achievements
page. Each has trigger conditions evaluated after every activity completion.

### Achievement record fields
`id`, `title`, `description`, `icon` (gold pixel icon), `rarity`
(`common | rare | epic`), `unlockedAt` (null until earned), `xpReward`.

### Example achievement list
| id | Title | Trigger | Rarity |
|---|---|---|---|
| `first_steps` | First Steps | Complete any 1 activity | common |
| `bookworm_5` | Bookworm | Read 5 Book worm passages | common |
| `quiz_perfect` | Flawless | Score 100% on a Pop up Quiz! | rare |
| `speed_demon` | Speed Demon | Finish a quiz with all answers under 3s | rare |
| `grammar_guardian` | Grammar Guardian | Complete all Grammar topics | epic |
| `good_ear` | Good Ear | Complete 5 Listening clips | common |
| `silver_tongue` | Silver Tongue | Self-rate 3★ on 10 Speaking prompts | rare |
| `streak_7` | Week Warrior | Reach a 7-day streak | rare |
| `streak_30` | Unstoppable | Reach a 30-day streak | epic |
| `level_10` | Scholar | Reach Level 10 | epic |
| `all_rounder` | All-Rounder | Complete ≥ 1 item in each of the 5 categories | rare |
| `night_owl` | Night Owl | Complete an activity after midnight (local) | common |

### Evaluation model
- A pure function `evaluateAchievements(state) -> newlyUnlocked[]` runs after
  each completion. It compares current stats against every locked achievement's
  condition and returns any that now pass.
- Newly unlocked → set `unlockedAt`, award `xpReward`, push an
  `ActivityLogEntry` ("Unlocked: {title}"), fire a slime celebration.
- Keep conditions as small predicates over the store so adding an achievement =
  adding one predicate + one row.

> **Future / out of scope for v1:** global/social leaderboards, comparing to
> other users, sharing badges. Single-player only.

## 5. Recent Activity feed

The dashboard **Recent Activity** card is a reverse-chronological view of
`ActivityLogEntry` records (see `DATA_MODEL.md`).

- **Who writes entries:** every feature completion, every level-up, every
  achievement unlock, every streak milestone.
- **Shape shown:** icon (per `type`) + message + relative time ("2h ago").
- **Empty state:** "No activity yet — start a quest!" with the slime NPC
  prompting the first action (matches PLAN.md's "No activity yet.").
- Cap the rendered list (e.g. latest 8–10); keep full log in store but trim to a
  max length (e.g. 100) to bound `localStorage` size.

## 6. Character & slime NPC reactions

Ties the pixel sprites to progress so the dashboard feels alive (cosmetic, but
part of the theme's identity).

### Blue slime NPC (Recent Activity card)
Shows a contextual speech bubble driven by recent state:
| Condition | Slime line (example) |
|---|---|
| No activity yet | "Ready to learn? Pick a quest!" |
| Mid-session / normal | "Nice work — keep it up!" |
| Achievement just unlocked | "New badge! You're on fire! 🔥" |
| Level-up | "LEVEL UP! You're getting strong!" |
| Streak milestone | "{n}-day streak! Legendary." |
| Returning after a gap | "Welcome back, adventurer!" |

Priority: level-up > achievement > streak milestone > returning > normal >
empty. Pick the highest-priority applicable line on dashboard load.

### Student character (Hero card)
Mostly decorative (reading a book). Optional: a brief celebration pose/animation
overlay on level-up milestones. Not required for v1 correctness — flag as a
polish item.

> **Future / out of scope for v1:** dynamic dialogue trees, NPC quests, animated
> cutscenes. v1 = a lookup table of canned lines keyed on current state.
