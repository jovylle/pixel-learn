<script setup>
// Fill-in-the-blank: type the missing word, checked case-insensitively.
// Retry-on-wrong per FEATURES.md's Grammar drill flow — a wrong attempt
// reveals the hint (if any) and lets the learner try again.
import { ref } from 'vue'

import PixelButton from '@/components/ui/PixelButton.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'

const props = defineProps({
  exercise: { type: Object, required: true },
})

const emit = defineEmits(['solved'])

const value = ref('')
const checked = ref(false)
const correct = ref(false)
const showHint = ref(false)
const firstTryCorrect = ref(null)

function checkAnswer() {
  checked.value = true
  correct.value = value.value.trim().toLowerCase() === props.exercise.answer.trim().toLowerCase()
  if (firstTryCorrect.value === null) firstTryCorrect.value = correct.value
  if (correct.value) {
    emit('solved', firstTryCorrect.value)
  } else {
    showHint.value = true
  }
}

function retry() {
  value.value = ''
  checked.value = false
  correct.value = false
}
</script>

<template>
  <PixelPanel>
    <p class="mb-3 font-body text-sm text-text-primary md:text-base">{{ exercise.sentence }}</p>
    <input
      v-model="value"
      type="text"
      :disabled="checked && correct"
      placeholder="Type your answer"
      class="w-full rounded-[var(--radius-pixel-sm)] border-2 border-panel-border bg-panel-bg/60 px-3 py-2 font-body text-sm text-text-primary outline-none focus:border-accent-blue disabled:opacity-50 md:text-base"
      @keyup.enter="!checked || !correct ? checkAnswer() : null"
    />

    <p v-if="showHint && exercise.hint" class="mt-2 font-body text-xs text-text-secondary md:text-sm">
      Hint: {{ exercise.hint }}
    </p>

    <p
      v-if="checked"
      class="mt-2 font-body text-xs md:text-sm"
      :class="correct ? 'text-green-400' : 'text-red-400'"
    >
      {{ correct ? 'Correct!' : 'Not quite — try again.' }}
    </p>

    <div class="mt-3 flex justify-end gap-2">
      <PixelButton v-if="checked && !correct" @click="retry">Try again</PixelButton>
      <PixelButton v-else-if="!checked" variant="primary" :disabled="!value.trim()" @click="checkAnswer">
        Check
      </PixelButton>
    </div>
  </PixelPanel>
</template>
