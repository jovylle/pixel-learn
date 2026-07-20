<script setup>
// Unlike Bookworm's comprehension flow (answer-all-then-submit), Pop up Quiz!
// advances immediately per question with a brief correct/incorrect flash —
// MCQuestionCard's own "answered" coloring provides that flash, we just hold
// on it for a beat before moving on.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import MCQuestionCard from '@/components/ui/MCQuestionCard.vue'

import QuestionTimerRing from './QuestionTimerRing.vue'

const props = defineProps({
  round: { type: Object, required: true },
})

const emit = defineEmits(['complete'])

const FEEDBACK_DELAY_MS = 700

const index = ref(0)
const selectedIndex = ref(null)
const answered = ref(false)
const secondsLeft = ref(props.round.perQuestionSeconds)
const results = ref([])

let questionStartedAt = Date.now()
let tickHandle = null
let advanceHandle = null

const currentQuestion = computed(() => props.round.questions[index.value])
const isLast = computed(() => index.value === props.round.questions.length - 1)

function startTimer() {
  secondsLeft.value = props.round.perQuestionSeconds
  questionStartedAt = Date.now()
  clearInterval(tickHandle)
  tickHandle = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) {
      clearInterval(tickHandle)
      if (!answered.value) selectAnswer(null) // timeout counts as an (incorrect) answer
    }
  }, 1000)
}

function selectAnswer(optionIndex) {
  if (answered.value) return
  answered.value = true
  selectedIndex.value = optionIndex
  clearInterval(tickHandle)

  const timeMs = Date.now() - questionStartedAt
  const correct = optionIndex !== null && optionIndex === currentQuestion.value.correctIndex
  results.value.push({ questionId: currentQuestion.value.id, correct, timeMs })

  advanceHandle = setTimeout(advance, FEEDBACK_DELAY_MS)
}

function advance() {
  if (isLast.value) {
    emit('complete', results.value)
    return
  }
  index.value += 1
  selectedIndex.value = null
  answered.value = false
  startTimer()
}

onMounted(startTimer)
onBeforeUnmount(() => {
  clearInterval(tickHandle)
  clearTimeout(advanceHandle)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-4 font-body text-xs text-text-secondary md:text-sm">
      <span>Question {{ index + 1 }} / {{ round.questions.length }}</span>
      <QuestionTimerRing
        class="w-32"
        :seconds-left="Math.max(secondsLeft, 0)"
        :total-seconds="round.perQuestionSeconds"
      />
    </div>
    <MCQuestionCard
      :key="currentQuestion.id"
      :question="currentQuestion"
      :selected-index="selectedIndex"
      :answered="answered"
      @select="selectAnswer"
    />
  </div>
</template>
