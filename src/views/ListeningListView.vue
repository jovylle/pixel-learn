<script setup>
import LevelBadge from '@/components/ui/LevelBadge.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

function isComplete(id) {
  return store.progress.some((p) => p.itemId === id && p.status === 'complete')
}

function estMinutes(seconds) {
  return Math.max(1, Math.round(seconds / 60))
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-4 md:p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="flex items-center gap-2 font-pixel text-sm text-text-primary md:text-base">
        <PixelIcon name="headphones" class="text-xl" /> Listening
      </h1>
      <RouterLink to="/" class="font-body text-sm text-text-secondary hover:text-accent-blue">
        ← Dashboard
      </RouterLink>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink v-for="clip in store.content.listening" :key="clip.id" :to="`/listening/${clip.id}`" class="block">
        <PixelPanel class="h-full transition-colors hover:border-accent-blue">
          <div class="mb-2 flex items-start justify-between gap-2">
            <h2 class="font-pixel text-xs text-text-primary md:text-sm">{{ clip.title }}</h2>
            <PixelIcon
              v-if="isComplete(clip.id)"
              name="lesson-complete"
              class="shrink-0 text-lg text-accent-gold"
              aria-label="Completed"
            />
          </div>
          <div class="flex items-center gap-3 font-body text-xs text-text-secondary md:text-sm">
            <LevelBadge :level="clip.level" />
            <span class="flex items-center gap-1">
              <PixelIcon name="clock" class="text-sm" /> {{ estMinutes(clip.durationSeconds) }} min
            </span>
          </div>
        </PixelPanel>
      </RouterLink>
    </div>
  </div>
</template>
