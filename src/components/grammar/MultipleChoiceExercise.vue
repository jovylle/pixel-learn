<script setup>
// Thin wrapper around the shared MCQuestionCard, adding retry-on-wrong —
// MCQuestionCard itself locks after the first pick, so we reset its
// `answered` state locally to let the learner pick again.
import { computed, ref } from 'vue'

import MCQuestionCard from '@/components/ui/MCQuestionCard.vue'
import PixelButton from '@/components/ui/PixelButton.vue'

const props = defineProps({
  exercise: { type: Object, required: true },
})

const emit = defineEmits(['solved'])

const selectedIndex = ref(null)
const answered = ref(false)
const firstTryCorrect = ref(null)

function selectOption(index) {
  selectedIndex.value = index
  answered.value = true
  const correct = index === props.exercise.question.correctIndex
  if (firstTryCorrect.value === null) firstTryCorrect.value = correct
  if (correct) emit('solved', firstTryCorrect.value)
}

function retry() {
  selectedIndex.value = null
  answered.value = false
}

const isWrong = computed(() => answered.value && selectedIndex.value !== props.exercise.question.correctIndex)
</script>

<template>
  <div>
    <MCQuestionCard
      :question="exercise.question"
      :selected-index="selectedIndex"
      :answered="answered"
      @select="selectOption"
    />
    <div v-if="isWrong" class="mt-2 flex justify-end">
      <PixelButton @click="retry">Try again</PixelButton>
    </div>
  </div>
</template>
