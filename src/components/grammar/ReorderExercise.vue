<script setup>
// Sentence reorder: click-to-select-in-order rather than true drag-and-drop
// (no npm drag library allowed for this pass, and click ordering is the
// simpler interaction FEATURES.md explicitly allows for a hobby project).
import { computed, ref } from 'vue'

import PixelButton from '@/components/ui/PixelButton.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'

const props = defineProps({
  exercise: { type: Object, required: true },
})

const emit = defineEmits(['solved'])

const picked = ref([]) // ordered list of token indices
const checked = ref(false)
const correct = ref(false)
const firstTryCorrect = ref(null)

const remainingIndices = computed(() =>
  props.exercise.tokens.map((_, i) => i).filter((i) => !picked.value.includes(i)),
)
const isComplete = computed(() => picked.value.length === props.exercise.tokens.length)

function pick(index) {
  if (checked.value && correct.value) return
  picked.value.push(index)
}

function checkOrder() {
  checked.value = true
  correct.value =
    picked.value.length === props.exercise.correctOrder.length &&
    picked.value.every((tokenIndex, i) => tokenIndex === props.exercise.correctOrder[i])
  if (firstTryCorrect.value === null) firstTryCorrect.value = correct.value
  if (correct.value) emit('solved', firstTryCorrect.value)
}

function retry() {
  picked.value = []
  checked.value = false
  correct.value = false
}
</script>

<template>
  <PixelPanel>
    <p class="mb-3 font-body text-xs text-text-secondary md:text-sm">Tap the words in the correct order:</p>

    <div class="mb-3 flex min-h-[2.5rem] flex-wrap gap-2 rounded-[var(--radius-pixel-sm)] border-2 border-dashed border-panel-border p-2">
      <button
        v-for="(tokenIndex, i) in picked"
        :key="`picked-${i}`"
        type="button"
        :disabled="checked && correct"
        class="rounded-[var(--radius-pixel-sm)] border-2 border-accent-blue bg-panel-bg/60 px-3 py-1 font-body text-sm text-accent-blue"
      >
        {{ exercise.tokens[tokenIndex] }}
      </button>
    </div>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="tokenIndex in remainingIndices"
        :key="`pool-${tokenIndex}`"
        type="button"
        class="rounded-[var(--radius-pixel-sm)] border-2 border-panel-border bg-panel-bg/60 px-3 py-1 font-body text-sm text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
        @click="pick(tokenIndex)"
      >
        {{ exercise.tokens[tokenIndex] }}
      </button>
    </div>

    <p
      v-if="checked"
      class="mb-2 font-body text-xs md:text-sm"
      :class="correct ? 'text-green-400' : 'text-red-400'"
    >
      {{ correct ? 'Correct!' : 'Not quite — try again.' }}
    </p>

    <div class="flex justify-end gap-2">
      <PixelButton v-if="checked && !correct" @click="retry">Try again</PixelButton>
      <PixelButton v-else-if="!checked" variant="primary" :disabled="!isComplete" @click="checkOrder">
        Check
      </PixelButton>
    </div>
  </PixelPanel>
</template>
