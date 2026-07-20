// Pure gamification logic per GAMIFICATION.md.
// Kept as small, plain exported functions (not buried in store/component
// methods) so they stay unit-testable per ONBOARDING_AND_POLISH.md's
// "what's worth unit-testing" list — no Vue/Pinia imports in this file.

import { daysBetween, todayLocalDateString } from './date'

/**
 * Cumulative XP required to FINISH level L (i.e. to reach level L + 1).
 * xpForLevel(1) = 100, xpForLevel(2) = 300, xpForLevel(3) = 600 ...
 */
export function xpForLevel(level) {
  return 100 * level * (level + 1) / 2
}

/**
 * Derive { level, xpIntoLevel, xpForNext } from cumulative User.xp.
 * Level 1 starts at 0 xp; xpForLevel(0) is defined as 0.
 */
export function levelFromXp(xp) {
  const safeXp = Math.max(0, xp || 0)
  let level = 1
  while (safeXp >= xpForLevel(level)) {
    level += 1
  }
  const floor = xpForLevel(level - 1)
  const ceil = xpForLevel(level)
  return {
    level,
    xpIntoLevel: safeXp - floor,
    xpForNext: ceil - floor,
  }
}

/** Dashboard "% Completed" — overall course completion, not XP-driven. */
export function percentCompleted(completedItems, totalItems) {
  if (!totalItems) return 0
  return Math.round((completedItems / totalItems) * 100)
}

/**
 * Streak transition per GAMIFICATION.md §3.
 * Pure: takes the current Streak + "today" and returns the NEXT Streak,
 * it does not mutate the input.
 */
export function nextStreakState(streak, today = todayLocalDateString()) {
  const current = streak?.current ?? 0
  const longest = streak?.longest ?? 0
  const lastActiveDate = streak?.lastActiveDate ?? null

  if (!lastActiveDate) {
    return { current: 1, longest: Math.max(longest, 1), lastActiveDate: today }
  }
  if (lastActiveDate === today) {
    return { current, longest, lastActiveDate }
  }

  const gap = daysBetween(lastActiveDate, today)
  if (gap === 1) {
    const nextCurrent = current + 1
    return { current: nextCurrent, longest: Math.max(longest, nextCurrent), lastActiveDate: today }
  }
  // gap > 1 (or negative/clock weirdness) -> reset, keep longest
  return { current: 1, longest, lastActiveDate: today }
}

const STREAK_MILESTONES = [3, 7, 14, 30]

/** Which streak milestone (if any) `current` just landed on exactly. */
export function streakMilestoneHit(current) {
  return STREAK_MILESTONES.includes(current) ? current : null
}

const CATEGORY_IDS = ['bookworm', 'quiz', 'grammar', 'listening', 'speaking']

function isLateNight(iso) {
  const hour = new Date(iso).getHours()
  return hour >= 0 && hour < 5
}

function completedByCategory(progress) {
  const counts = { bookworm: 0, quiz: 0, grammar: 0, listening: 0, speaking: 0 }
  for (const record of progress) {
    if (record.status === 'complete' && counts[record.category] !== undefined) {
      counts[record.category] += 1
    }
  }
  return counts
}

// One predicate per row of GAMIFICATION.md's example achievement list.
// Adding an achievement = adding one predicate here + one row in achievements.json.
const ACHIEVEMENT_PREDICATES = {
  first_steps: (ctx) => ctx.progress.some((p) => p.status === 'complete'),
  bookworm_5: (ctx) => ctx.byCategory.bookworm >= 5,
  quiz_perfect: (ctx) =>
    ctx.progress.some((p) => p.category === 'quiz' && p.status === 'complete' && p.bestScore === 100),
  // TODO: needs per-answer timing data the Pop up Quiz! feature doesn't track
  // yet (it's a stub in this pass) — always false until that's wired up.
  speed_demon: () => false,
  grammar_guardian: (ctx) =>
    ctx.totalsByCategory.grammar > 0 && ctx.byCategory.grammar >= ctx.totalsByCategory.grammar,
  good_ear: (ctx) => ctx.byCategory.listening >= 5,
  silver_tongue: (ctx) =>
    ctx.progress.filter((p) => p.category === 'speaking' && p.selfScore === 3).length >= 10,
  streak_7: (ctx) => ctx.streak.current >= 7,
  streak_30: (ctx) => ctx.streak.current >= 30,
  level_10: (ctx) => ctx.level >= 10,
  all_rounder: (ctx) => CATEGORY_IDS.every((id) => ctx.byCategory[id] >= 1),
  night_owl: (ctx) => ctx.progress.some((p) => p.completedAt && isLateNight(p.completedAt)),
}

/**
 * Pure evaluation pass: given the current state + achievement definitions,
 * return the ids of achievements that are still locked but now pass their
 * trigger condition. Caller is responsible for setting unlockedAt, awarding
 * xpReward, and logging activity for each returned id.
 */
export function evaluateAchievements({ progress, achievements, streak, level, totalsByCategory }) {
  const ctx = {
    progress,
    streak: streak ?? { current: 0, longest: 0, lastActiveDate: null },
    level: level ?? 1,
    byCategory: completedByCategory(progress),
    totalsByCategory: totalsByCategory ?? {},
  }

  return achievements
    .filter((a) => !a.unlockedAt)
    .filter((a) => ACHIEVEMENT_PREDICATES[a.id]?.(ctx))
    .map((a) => a.id)
}

// Slime NPC speech-bubble line, priority per GAMIFICATION.md §6:
// level-up > achievement > streak milestone > returning > normal > empty.
export function getSlimeLine({
  hasActivity,
  justLeveledUp = false,
  justUnlockedAchievement = false,
  streakMilestone = null,
  returningAfterGap = false,
}) {
  if (!hasActivity) return 'Ready to learn? Pick a quest!'
  if (justLeveledUp) return "LEVEL UP! You're getting strong!"
  if (justUnlockedAchievement) return 'New badge! You\'re on fire! 🔥'
  if (streakMilestone) return `${streakMilestone}-day streak! Legendary.`
  if (returningAfterGap) return 'Welcome back, adventurer!'
  return 'Nice work — keep it up!'
}
