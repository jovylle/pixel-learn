<script setup>
import PixelPanel from './PixelPanel.vue'

const props = defineProps({
  question: { type: Object, required: true },
  selectedIndex: { type: Number, default: null },
  answered: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

function pick(index) {
  if (props.answered) return
  emit('select', index)
}

function optionState(index) {
  if (!props.answered) return props.selectedIndex === index ? 'selected' : 'idle'
  if (index === props.question.correctIndex) return 'correct'
  if (index === props.selectedIndex) return 'incorrect'
  return 'idle'
}
</script>

<template>
  <PixelPanel>
    <p class="mb-3 font-body text-sm text-text-primary md:text-base">{{ question.prompt }}</p>
    <div class="flex flex-col gap-2">
      <button
        v-for="(option, index) in question.options"
        :key="index"
        type="button"
        :disabled="answered"
        class="flex items-center justify-between gap-2 rounded-[var(--radius-pixel-sm)] border-2 px-3 py-2 text-left font-body text-sm transition-colors disabled:cursor-not-allowed"
        :class="{
          'border-panel-border bg-panel-bg/60 text-text-primary hover:border-accent-blue hover:text-accent-blue':
            optionState(index) === 'idle',
          'border-accent-blue bg-panel-bg/60 text-accent-blue': optionState(index) === 'selected',
          'border-green-500 bg-green-500/10 text-green-400': optionState(index) === 'correct',
          'border-red-500 bg-red-500/10 text-red-400': optionState(index) === 'incorrect',
        }"
        @click="pick(index)"
      >
        <span>{{ option }}</span>
        <span v-if="answered && optionState(index) === 'correct'" aria-hidden="true">✓</span>
        <span v-else-if="answered && optionState(index) === 'incorrect'" aria-hidden="true">✗</span>
      </button>
    </div>
    <p v-if="answered && question.explanation" class="mt-3 font-body text-xs text-text-secondary md:text-sm">
      {{ question.explanation }}
    </p>
  </PixelPanel>
</template>
