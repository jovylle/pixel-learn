<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import PixelAudioPlayer from '@/components/listening/PixelAudioPlayer.vue'
import CompletionScreen from '@/components/ui/CompletionScreen.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MCQuestionCard from '@/components/ui/MCQuestionCard.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const store = useAppStore()

const clip = computed(() => store.content.listening.find((c) => c.id === route.params.id))

const step = ref('player') // 'player' | 'comprehension' | 'complete'
const answers = ref([])
const unlockedAchievements = ref([])

function startComprehension() {
  answers.value = clip.value.questions.map(() => null)
  step.value = 'comprehension'
}

const allAnswered = computed(() => answers.value.length > 0 && answers.value.every((a) => a !== null))

const score = computed(() => {
  if (!clip.value || !answers.value.length) return 0
  const correct = clip.value.questions.filter((q, i) => answers.value[i] === q.correctIndex).length
  return Math.round((correct / clip.value.questions.length) * 100)
})

// 20 base + up to 15 for comprehension score, per GAMIFICATION.md's
// "Listening clip: 20 base + comprehension score bonus" (same shape as
// Book worm's reading-passage formula).
const xpEarned = computed(() => 20 + Math.round((score.value / 100) * 15))

function selectAnswer(index, optionIndex) {
  if (answers.value[index] !== null) return
  answers.value[index] = optionIndex
}

function submitComprehension() {
  const before = store.achievements.filter((a) => a.unlockedAt).map((a) => a.id)
  store.recordCompletion({
    itemId: clip.value.id,
    category: 'listening',
    bestScore: score.value,
    message: `Completed listening: ${clip.value.title}`,
    xp: xpEarned.value,
  })
  unlockedAchievements.value = store.achievements.filter(
    (a) => a.unlockedAt && !before.includes(a.id),
  )
  step.value = 'complete'
}

const nextClip = computed(() => {
  const list = store.content.listening
  const currentIndex = list.findIndex((c) => c.id === clip.value?.id)
  for (let i = currentIndex + 1; i < list.length; i += 1) {
    const isComplete = store.progress.some((p) => p.itemId === list[i].id && p.status === 'complete')
    if (!isComplete) return list[i]
  }
  return null
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <EmptyState v-if="!clip" message="Couldn't load this clip.">
      <PixelButton as="RouterLink" to="/listening" class="mt-3">← Back to Listening</PixelButton>
    </EmptyState>

    <template v-else>
      <div class="mb-4 flex items-center justify-between">
        <h1 class="flex items-center gap-2 font-pixel text-sm text-text-primary md:text-base">
          <PixelIcon name="headphones" class="text-xl" /> {{ clip.title }}
        </h1>
        <RouterLink to="/listening" class="font-body text-sm text-text-secondary hover:text-accent-blue">
          ← Listening
        </RouterLink>
      </div>

      <div v-if="step === 'player'" class="flex flex-col gap-4">
        <PixelAudioPlayer
          :src="clip.audioSrc"
          :transcript="clip.transcript"
          :fallback-duration-seconds="clip.durationSeconds"
        />
        <div class="flex justify-center">
          <PixelButton variant="primary" @click="startComprehension">Continue to questions</PixelButton>
        </div>
      </div>

      <div v-else-if="step === 'comprehension'" class="flex flex-col gap-4">
        <MCQuestionCard
          v-for="(question, index) in clip.questions"
          :key="question.id"
          :question="question"
          :selected-index="answers[index]"
          :answered="answers[index] !== null"
          @select="(optionIndex) => selectAnswer(index, optionIndex)"
        />
        <div class="flex justify-center">
          <PixelButton variant="primary" :disabled="!allAnswered" @click="submitComprehension">
            Submit
          </PixelButton>
        </div>
      </div>

      <CompletionScreen
        v-else
        :title="`Finished ${clip.title}! (${score}% comprehension)`"
        :xp="xpEarned"
        :streak="store.user?.streak"
        :achievements="unlockedAchievements"
      >
        <template #next>
          <PixelButton v-if="nextClip" as="RouterLink" :to="`/listening/${nextClip.id}`" variant="primary">
            Next clip: {{ nextClip.title }}
          </PixelButton>
          <PixelButton v-else as="RouterLink" to="/listening" variant="primary">Back to Listening</PixelButton>
        </template>
      </CompletionScreen>
    </template>
  </div>
</template>
