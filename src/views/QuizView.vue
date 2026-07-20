<script setup>
// v1 has no round-selection UI per FEATURES.md's "single route" framing —
// simplest correct behavior: pick a random bank from the mixed quiz banks
// each time /quiz is entered, matching "pull N questions from a mixed bank".
import { computed, ref } from 'vue'

import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import QuizIntro from '@/components/quiz/QuizIntro.vue'
import QuizPlayer from '@/components/quiz/QuizPlayer.vue'
import QuizResults from '@/components/quiz/QuizResults.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const round = ref(pickRandomRound())
const step = ref('intro') // 'intro' | 'playing' | 'results'

const results = ref([])
const unlockedAchievements = ref([])

function pickRandomRound() {
  const banks = store.content.quiz
  return banks[Math.floor(Math.random() * banks.length)]
}

function startQuiz() {
  step.value = 'playing'
}

const correctCount = computed(() => results.value.filter((r) => r.correct).length)

const fastestMs = computed(() => {
  const correctTimes = results.value.filter((r) => r.correct).map((r) => r.timeMs)
  return correctTimes.length ? Math.min(...correctTimes) : null
})

const bestStreak = computed(() => {
  let best = 0
  let current = 0
  for (const r of results.value) {
    current = r.correct ? current + 1 : 0
    best = Math.max(best, current)
  }
  return best
})

// Speed bonus (up to 10) rewards a fast average time on correct answers,
// relative to the round's per-question time budget.
const speedBonus = computed(() => {
  const correctResults = results.value.filter((r) => r.correct)
  if (!correctResults.length) return 0
  const avgMs = correctResults.reduce((sum, r) => sum + r.timeMs, 0) / correctResults.length
  const budgetMs = round.value.perQuestionSeconds * 1000
  const speedRatio = Math.max(0, Math.min(1, 1 - avgMs / budgetMs))
  return Math.round(speedRatio * 10)
})

const xpEarned = computed(() => correctCount.value * 5 + speedBonus.value)

function finishQuiz(sessionResults) {
  results.value = sessionResults
  const score = Math.round((correctCount.value / round.value.questions.length) * 100)

  const before = store.achievements.filter((a) => a.unlockedAt).map((a) => a.id)
  store.recordCompletion({
    itemId: round.value.id,
    category: 'quiz',
    bestScore: score,
    message: `Scored ${correctCount.value}/${round.value.questions.length} on a Pop up Quiz!`,
    xp: xpEarned.value,
  })
  unlockedAchievements.value = store.achievements.filter(
    (a) => a.unlockedAt && !before.includes(a.id),
  )
  step.value = 'results'
}

function playAgain() {
  round.value = pickRandomRound()
  results.value = []
  unlockedAchievements.value = []
  step.value = 'intro'
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="flex items-center gap-2 font-pixel text-sm text-text-primary md:text-base">
        <PixelIcon name="lightning" class="text-xl" /> Pop up Quiz!
      </h1>
      <RouterLink to="/" class="font-body text-sm text-text-secondary hover:text-accent-blue">
        ← Dashboard
      </RouterLink>
    </div>

    <QuizIntro v-if="step === 'intro'" :round="round" @start="startQuiz" />

    <QuizPlayer v-else-if="step === 'playing'" :round="round" @complete="finishQuiz" />

    <QuizResults
      v-else
      :correct-count="correctCount"
      :total-questions="round.questions.length"
      :fastest-ms="fastestMs"
      :best-streak="bestStreak"
      :xp="xpEarned"
      :streak="store.user?.streak"
      :achievements="unlockedAchievements"
    >
      <template #next>
        <PixelButton variant="primary" @click="playAgain">Play again</PixelButton>
      </template>
    </QuizResults>
  </div>
</template>
