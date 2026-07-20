<script setup>
import CompletionScreen from '@/components/ui/CompletionScreen.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'

defineProps({
  correctCount: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  fastestMs: { type: Number, default: null },
  bestStreak: { type: Number, required: true },
  xp: { type: Number, required: true },
  streak: { type: Object, default: null },
  achievements: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <PixelPanel class="text-center">
      <p class="mb-3 font-body text-sm text-text-secondary md:text-base">
        Score: <span class="text-text-primary">{{ correctCount }} / {{ totalQuestions }}</span>
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4 font-body text-xs text-text-secondary md:text-sm">
        <span v-if="fastestMs !== null" class="flex items-center gap-1">
          <PixelIcon name="clock" class="text-sm" /> Fastest: {{ (fastestMs / 1000).toFixed(1) }}s
        </span>
        <span class="flex items-center gap-1">
          <PixelIcon name="lightning" class="text-sm" /> Best streak: {{ bestStreak }}
        </span>
      </div>
    </PixelPanel>

    <CompletionScreen
      :title="`Scored ${correctCount}/${totalQuestions} on Pop up Quiz!`"
      :xp="xp"
      :streak="streak"
      :achievements="achievements"
    >
      <template #next>
        <slot name="next" />
      </template>
    </CompletionScreen>
  </div>
</template>
