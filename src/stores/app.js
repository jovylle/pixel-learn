import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import achievementDefs from '@/data/achievements.json'
import bookwormContent from '@/data/bookworm.json'
import categories from '@/data/categories.json'
import grammarContent from '@/data/grammar.json'
import listeningContent from '@/data/listening.json'
import quizContent from '@/data/quiz.json'
import speakingContent from '@/data/speaking.json'

import { todayLocalDateString } from '@/lib/date'
import {
  evaluateAchievements,
  levelFromXp,
  nextStreakState,
  percentCompleted,
  streakMilestoneHit,
} from '@/lib/gamification'

// localStorage keys per DATA_MODEL.md — exact strings, do not rename.
const KEYS = {
  user: 'pixel-learn:user',
  progress: 'pixel-learn:progress',
  achievements: 'pixel-learn:achievements',
  activity: 'pixel-learn:activity',
  schemaVersion: 'pixel-learn:schemaVersion',
}
const SCHEMA_VERSION = 1
const MAX_ACTIVITY_LOG = 100

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode / quota) — fail silently, v1 has no server fallback.
  }
}

function nowMinus(ms) {
  return new Date(Date.now() - ms).toISOString()
}

function freshAchievements() {
  return achievementDefs.map((a) => ({ ...a, unlockedAt: null }))
}

function defaultUser({ username, displayName, avatarSeed }) {
  return {
    id: 'local-user',
    username,
    displayName: displayName ?? username,
    avatarSeed,
    xp: 0,
    streak: { current: 0, longest: 0, lastActiveDate: null },
    stats: { readingSeconds: 0 },
    createdAt: new Date().toISOString(),
  }
}

export const useAppStore = defineStore('app', () => {
  // --- state -----------------------------------------------------------
  const user = ref(readJSON(KEYS.user, null))
  const progress = ref(readJSON(KEYS.progress, []))
  const achievements = ref(readJSON(KEYS.achievements, freshAchievements()))
  const activity = ref(readJSON(KEYS.activity, []))

  if (!readJSON(KEYS.schemaVersion, null)) {
    writeJSON(KEYS.schemaVersion, SCHEMA_VERSION)
  }

  // Static bundled content — read-only, not persisted to localStorage.
  const content = {
    categories,
    bookworm: bookwormContent,
    quiz: quizContent,
    grammar: grammarContent,
    listening: listeningContent,
    speaking: speakingContent,
  }
  const totalsByCategory = {
    bookworm: bookwormContent.length,
    quiz: quizContent.length,
    grammar: grammarContent.length,
    listening: listeningContent.length,
    speaking: speakingContent.length,
  }
  const totalItems = Object.values(totalsByCategory).reduce((a, b) => a + b, 0)

  // --- persistence helpers ----------------------------------------------
  function persistUser() {
    writeJSON(KEYS.user, user.value)
  }
  function persistProgress() {
    writeJSON(KEYS.progress, progress.value)
  }
  function persistAchievements() {
    writeJSON(KEYS.achievements, achievements.value)
  }
  function persistActivity() {
    writeJSON(KEYS.activity, activity.value)
  }

  // --- derived / computed (GAMIFICATION.md formulas) ---------------------
  const hasUser = computed(() => user.value !== null)

  const levelInfo = computed(() => levelFromXp(user.value?.xp ?? 0))
  const level = computed(() => levelInfo.value.level)
  const xpIntoLevel = computed(() => levelInfo.value.xpIntoLevel)
  const xpForNext = computed(() => levelInfo.value.xpForNext)

  const completedItems = computed(() => progress.value.filter((p) => p.status === 'complete').length)
  const percentCompletedValue = computed(() => percentCompleted(completedItems.value, totalItems))

  const lessonsCount = computed(() => completedItems.value)
  const achievementsCount = computed(() => achievements.value.filter((a) => a.unlockedAt).length)
  const readingHours = computed(() => (user.value?.stats.readingSeconds ?? 0) / 3600)

  const recentActivity = computed(() => activity.value.slice(0, 10))

  const isReturningAfterGap = computed(() => {
    const last = user.value?.streak?.lastActiveDate
    if (!last) return false
    const today = todayLocalDateString()
    if (last === today) return false
    // More than 1 day since last activity = a gap.
    return today > last
  })

  const slimeContext = computed(() => ({
    hasActivity: activity.value.length > 0,
    returningAfterGap: isReturningAfterGap.value,
  }))

  // --- mutations ----------------------------------------------------------
  function addActivity(entry) {
    activity.value.unshift({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry,
    })
    if (activity.value.length > MAX_ACTIVITY_LOG) {
      activity.value.length = MAX_ACTIVITY_LOG
    }
    persistActivity()
  }

  function awardXp(amount) {
    if (!user.value || !amount) return
    const before = levelFromXp(user.value.xp).level
    user.value.xp += amount
    const after = levelFromXp(user.value.xp).level
    for (let lvl = before + 1; lvl <= after; lvl += 1) {
      addActivity({ type: 'level-up', message: `Reached Level ${lvl}!`, icon: 'level-up' })
    }
    persistUser()
  }

  function touchStreak() {
    if (!user.value) return null
    const today = todayLocalDateString()
    const prev = user.value.streak
    const next = nextStreakState(prev, today)
    const milestone = next.current !== prev.current ? streakMilestoneHit(next.current) : null
    user.value.streak = next
    if (milestone) {
      addActivity({
        type: 'streak-milestone',
        message: `${milestone}-day streak! Legendary.`,
        icon: 'streak-milestone',
      })
    }
    persistUser()
    return milestone
  }

  function runAchievementEval() {
    const newlyUnlockedIds = evaluateAchievements({
      progress: progress.value,
      achievements: achievements.value,
      streak: user.value.streak,
      level: level.value,
      totalsByCategory,
    })
    for (const id of newlyUnlockedIds) {
      const badge = achievements.value.find((a) => a.id === id)
      if (!badge) continue
      badge.unlockedAt = new Date().toISOString()
      addActivity({ type: 'achievement', message: `Unlocked: ${badge.title}`, icon: 'achievement' })
      awardXp(badge.xpReward)
    }
    if (newlyUnlockedIds.length) persistAchievements()
    return newlyUnlockedIds
  }

  /**
   * Shared completion write per FEATURES.md's "common data writes" contract.
   * Every feature module (book worm, quiz, grammar, listening, speaking) is
   * meant to call this on completion; features themselves are stubs in this
   * pass, but the pipeline is fully wired for when they land.
   */
  function recordCompletion({ itemId, category, bestScore, selfScore, message, xp, readingSeconds, status = 'complete' }) {
    const now = new Date().toISOString()
    let record = progress.value.find((p) => p.itemId === itemId)
    if (!record) {
      record = {
        itemId,
        category,
        status: 'complete',
        attempts: 0,
        startedAt: now,
        updatedAt: now,
      }
      progress.value.push(record)
    }
    record.attempts += 1
    record.updatedAt = now
    record.status = status
    if (status === 'complete') record.completedAt = now
    if (bestScore !== undefined) record.bestScore = Math.max(record.bestScore ?? 0, bestScore)
    if (selfScore !== undefined) record.selfScore = selfScore
    persistProgress()

    if (readingSeconds) {
      user.value.stats.readingSeconds += readingSeconds
      persistUser()
    }
    if (message) {
      addActivity({ type: 'lesson-complete', category, message, icon: 'lesson-complete', xpEarned: xp })
    }
    if (xp) awardXp(xp)
    touchStreak()
    runAchievementEval()
  }

  function createUser({ username, avatarSeed }) {
    user.value = defaultUser({ username, avatarSeed })
    achievements.value = freshAchievements()
    progress.value = []
    activity.value = []
    persistUser()
    persistAchievements()
    persistProgress()
    persistActivity()
    writeJSON(KEYS.schemaVersion, SCHEMA_VERSION)
    seedDemoData()
  }

  function resetProgress() {
    if (!user.value) return
    user.value.xp = 0
    user.value.streak = { current: 0, longest: 0, lastActiveDate: null }
    user.value.stats = { readingSeconds: 0 }
    achievements.value = freshAchievements()
    progress.value = []
    activity.value = []
    persistUser()
    persistAchievements()
    persistProgress()
    persistActivity()
  }

  /**
   * Demo/seed dataset so a fresh install doesn't look empty (per PLAN.md's
   * "validate structure with mock data" build step). Writes are backdated
   * directly rather than routed through recordCompletion so the Recent
   * Activity feed shows varied relative timestamps instead of a wall of
   * "just now" entries.
   */
  function seedDemoData() {
    progress.value = [
      {
        itemId: 'bookworm:the-lantern',
        category: 'bookworm',
        status: 'complete',
        bestScore: 82,
        attempts: 1,
        startedAt: nowMinus(49 * 3600_000),
        updatedAt: nowMinus(48 * 3600_000),
        completedAt: nowMinus(48 * 3600_000),
      },
      {
        itemId: 'bookworm:the-old-bridge',
        category: 'bookworm',
        status: 'complete',
        bestScore: 88,
        attempts: 1,
        startedAt: nowMinus(25 * 3600_000),
        updatedAt: nowMinus(24 * 3600_000),
        completedAt: nowMinus(24 * 3600_000),
      },
      {
        itemId: 'grammar:present-simple',
        category: 'grammar',
        status: 'complete',
        bestScore: 75,
        attempts: 2,
        startedAt: nowMinus(21 * 3600_000),
        updatedAt: nowMinus(20 * 3600_000),
        completedAt: nowMinus(20 * 3600_000),
      },
      {
        itemId: 'listening:cafe-order',
        category: 'listening',
        status: 'complete',
        bestScore: 85,
        attempts: 1,
        startedAt: nowMinus(3 * 3600_000 + 600_000),
        updatedAt: nowMinus(3 * 3600_000),
        completedAt: nowMinus(3 * 3600_000),
      },
    ]
    persistProgress()

    user.value.stats.readingSeconds = 5400 // 1.5h
    user.value.streak = {
      current: 2,
      longest: 2,
      lastActiveDate: todayLocalDateString(),
    }
    user.value.xp = 175 // 35 (Lantern) + 35 (Old Bridge) + 35 (grammar) + 35 (listening) + 25 (achievement)
    persistUser()

    achievements.value = freshAchievements()
    const firstSteps = achievements.value.find((a) => a.id === 'first_steps')
    if (firstSteps) firstSteps.unlockedAt = nowMinus(49 * 3600_000)
    persistAchievements()

    activity.value = [
      { id: crypto.randomUUID(), type: 'lesson-complete', category: 'listening', message: 'Completed listening: Ordering at a Cafe', icon: 'lesson-complete', xpEarned: 35, createdAt: nowMinus(3 * 3600_000) },
      { id: crypto.randomUUID(), type: 'lesson-complete', category: 'grammar', message: 'Completed Grammar topic: Present Simple', icon: 'lesson-complete', xpEarned: 35, createdAt: nowMinus(20 * 3600_000) },
      { id: crypto.randomUUID(), type: 'lesson-complete', category: 'bookworm', message: 'Finished reading The Old Bridge', icon: 'lesson-complete', xpEarned: 35, createdAt: nowMinus(24 * 3600_000) },
      { id: crypto.randomUUID(), type: 'lesson-complete', category: 'bookworm', message: 'Finished reading The Lantern', icon: 'lesson-complete', xpEarned: 35, createdAt: nowMinus(48 * 3600_000) },
      { id: crypto.randomUUID(), type: 'achievement', message: 'Unlocked: First Steps', icon: 'achievement', xpEarned: 25, createdAt: nowMinus(49 * 3600_000) },
    ]
    persistActivity()
  }

  return {
    user,
    progress,
    achievements,
    activity,
    content,
    totalItems,
    totalsByCategory,

    hasUser,
    level,
    xpIntoLevel,
    xpForNext,
    completedItems,
    percentCompletedValue,
    lessonsCount,
    achievementsCount,
    readingHours,
    recentActivity,
    slimeContext,

    createUser,
    recordCompletion,
    resetProgress,
    addActivity,
    awardXp,
    touchStreak,
    runAchievementEval,
  }
})
