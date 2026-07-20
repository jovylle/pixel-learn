<script setup>
// Simple countdown bar for the current question's time budget. No animation
// library — a CSS transition on width does the ticking visual.
import { computed } from 'vue'

const props = defineProps({
  secondsLeft: { type: Number, required: true },
  totalSeconds: { type: Number, required: true },
})

const percentLeft = computed(() => Math.max(0, Math.min(100, (props.secondsLeft / props.totalSeconds) * 100)))
const isUrgent = computed(() => props.secondsLeft <= Math.ceil(props.totalSeconds * 0.3))
</script>

<template>
  <div class="flex items-center gap-2" role="timer" :aria-label="`${secondsLeft} seconds left`">
    <div class="h-2 flex-1 overflow-hidden rounded-[var(--radius-pixel-sm)] border border-panel-border bg-panel-bg/60">
      <div
        class="h-full transition-[width] duration-300 ease-linear"
        :class="isUrgent ? 'bg-red-500' : 'bg-accent-blue'"
        :style="{ width: `${percentLeft}%` }"
      />
    </div>
    <span
      class="w-6 shrink-0 text-right font-pixel text-[10px]"
      :class="isUrgent ? 'text-red-400' : 'text-text-secondary'"
    >
      {{ secondsLeft }}s
    </span>
  </div>
</template>
