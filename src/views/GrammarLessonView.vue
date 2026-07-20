<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import CompletionScreen from '@/components/ui/CompletionScreen.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import DrillRunner from '@/components/grammar/DrillRunner.vue'
import LessonCard from '@/components/grammar/LessonCard.vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const store = useAppStore()

const orderedTopics = [...store.content.grammar].sort((a, b) => a.order - b.order)
const topic = computed(() => orderedTopics.find((t) => t.id === route.params.id))

const step = ref('lesson') // 'lesson' | 'drill' | 'complete'
const mastery = ref(0)
const xpEarned = ref(0)
const unlockedAchievements = ref([])

function startDrill() {
  step.value = 'drill'
}

function finishDrill(firstTryResults) {
  const correctCount = firstTryResults.filter(Boolean).length
  mastery.value = Math.round((correctCount / firstTryResults.length) * 100)

  // 25 base + mastery bonus per GAMIFICATION.md's "Grammar topic drill" row.
  xpEarned.value = 25 + Math.round((mastery.value / 100) * 15)

  const before = store.achievements.filter((a) => a.unlockedAt).map((a) => a.id)
  store.recordCompletion({
    itemId: topic.value.id,
    category: 'grammar',
    bestScore: mastery.value,
    message: `Completed Grammar topic: ${topic.value.title}`,
    xp: xpEarned.value,
    status: mastery.value >= topic.value.masteryThreshold ? 'complete' : 'in-progress',
  })
  unlockedAchievements.value = store.achievements.filter(
    (a) => a.unlockedAt && !before.includes(a.id),
  )
  step.value = 'complete'
}

// Per FEATURES.md §3, the topic is only marked `complete` once mastery meets
// masteryThreshold; below that it's `in-progress` and the next topic stays
// locked (see GrammarTopicsView's unlock logic).
const nextTopic = computed(() => {
  if (!topic.value) return null
  return orderedTopics.find((t) => t.order === topic.value.order + 1) ?? null
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <EmptyState v-if="!topic" message="Couldn't load this topic.">
      <PixelButton as="RouterLink" to="/grammar" class="mt-3">← Back to Grammar</PixelButton>
    </EmptyState>

    <template v-else>
      <div class="mb-4 flex items-center justify-between">
        <h1 class="flex items-center gap-2 font-pixel text-sm text-text-primary md:text-base">
          <PixelIcon name="pencil" class="text-xl" /> {{ topic.title }}
        </h1>
        <RouterLink to="/grammar" class="font-body text-sm text-text-secondary hover:text-accent-blue">
          ← Grammar
        </RouterLink>
      </div>

      <LessonCard v-if="step === 'lesson'" :lesson="topic.lesson" @done="startDrill" />

      <DrillRunner v-else-if="step === 'drill'" :drills="topic.drills" @complete="finishDrill" />

      <CompletionScreen
        v-else
        :title="`Completed ${topic.title}! (${mastery}% mastery)`"
        :xp="xpEarned"
        :streak="store.user?.streak"
        :achievements="unlockedAchievements"
      >
        <template #next>
          <PixelButton v-if="nextTopic" as="RouterLink" :to="`/grammar/${nextTopic.id}`" variant="primary">
            Next topic: {{ nextTopic.title }}
          </PixelButton>
          <PixelButton v-else as="RouterLink" to="/grammar" variant="primary">Back to Topics</PixelButton>
        </template>
      </CompletionScreen>
    </template>
  </div>
</template>
