<script setup>
import PixelIcon from '@/components/ui/PixelIcon.vue'

// 1-3 star self-rating per FEATURES.md §5 — Tricky / Okay / Nailed it.
defineProps({
  modelValue: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue'])

const OPTIONS = [
  { score: 1, label: 'Tricky' },
  { score: 2, label: 'Okay' },
  { score: 3, label: 'Nailed it' },
]
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <p class="font-body text-sm text-text-secondary md:text-base">How did that feel?</p>
    <div class="flex gap-3">
      <button
        v-for="option in OPTIONS"
        :key="option.score"
        type="button"
        class="flex flex-col items-center gap-1 rounded-[var(--radius-pixel-sm)] border-2 px-3 py-2 font-body text-xs transition-colors md:text-sm"
        :class="
          modelValue === option.score
            ? 'border-accent-gold bg-panel-bg text-accent-gold'
            : 'border-panel-border bg-panel-bg/70 text-text-secondary hover:border-accent-gold hover:text-accent-gold'
        "
        @click="emit('update:modelValue', option.score)"
      >
        <span class="flex gap-0.5">
          <PixelIcon
            v-for="n in 3"
            :key="n"
            name="star"
            class="text-base"
            :class="n <= option.score ? 'opacity-100' : 'opacity-25'"
          />
        </span>
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
