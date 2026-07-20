<script setup>
import LevelBadge from '@/components/ui/LevelBadge.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import PixelProgressBar from '@/components/ui/PixelProgressBar.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

// Topics ordered by `order`, per CONTENT_AUTHORING.md's "order drives real
// unlock sequencing" note. There's no store method for unlock gating yet, so
// it's computed here: a topic unlocks once the previous-`order` topic is
// complete (order 1 is always unlocked).
const orderedTopics = [...store.content.grammar].sort((a, b) => a.order - b.order)

function progressFor(id) {
  return store.progress.find((p) => p.itemId === id)
}

function isComplete(id) {
  return progressFor(id)?.status === 'complete'
}

function isUnlocked(topic) {
  if (topic.order <= 1) return true
  const previous = orderedTopics.find((t) => t.order === topic.order - 1)
  return previous ? isComplete(previous.id) : true
}

function masteryFor(topic) {
  return progressFor(topic.id)?.bestScore ?? 0
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="flex items-center gap-2 font-pixel text-sm text-text-primary md:text-base">
        <PixelIcon name="pencil" class="text-xl" /> Grammar
      </h1>
      <RouterLink to="/" class="font-body text-sm text-text-secondary hover:text-accent-blue">
        ← Dashboard
      </RouterLink>
    </div>

    <div class="flex flex-col gap-3">
      <component
        :is="isUnlocked(topic) ? 'RouterLink' : 'div'"
        v-for="topic in orderedTopics"
        :key="topic.id"
        :to="isUnlocked(topic) ? `/grammar/${topic.id}` : undefined"
        class="block"
      >
        <PixelPanel
          class="transition-colors"
          :class="isUnlocked(topic) ? 'hover:border-accent-blue' : 'opacity-60'"
        >
          <div class="mb-2 flex items-start justify-between gap-2">
            <h2 class="font-pixel text-xs text-text-primary md:text-sm">{{ topic.title }}</h2>
            <PixelIcon
              v-if="isComplete(topic.id)"
              name="lesson-complete"
              class="shrink-0 text-lg text-accent-gold"
              aria-label="Completed"
            />
            <span v-else-if="!isUnlocked(topic)" class="shrink-0 text-lg" aria-label="Locked">🔒</span>
          </div>
          <div class="mb-2 flex items-center gap-3 font-body text-xs text-text-secondary md:text-sm">
            <LevelBadge :level="topic.level" />
          </div>
          <PixelProgressBar :percent="masteryFor(topic)" />
        </PixelPanel>
      </component>
    </div>
  </div>
</template>
