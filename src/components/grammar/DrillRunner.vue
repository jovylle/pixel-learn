<script setup>
// Iterates the topic's mixed drills, dispatching to the right exercise
// component by `kind`. Scoring counts first-try correctness only — retries
// let a learner keep moving through the drill, but don't inflate mastery.
import { computed, ref } from 'vue'

import PixelButton from '@/components/ui/PixelButton.vue'

import FillBlankExercise from './FillBlankExercise.vue'
import MultipleChoiceExercise from './MultipleChoiceExercise.vue'
import ReorderExercise from './ReorderExercise.vue'

const props = defineProps({
  drills: { type: Array, required: true },
})

const emit = defineEmits(['complete'])

const index = ref(0)
const firstTryResults = ref([])
const solved = ref(false)

const currentDrill = computed(() => props.drills[index.value])
const isLast = computed(() => index.value === props.drills.length - 1)

function handleSolved(firstTryCorrect) {
  firstTryResults.value[index.value] = firstTryCorrect
  solved.value = true
}

function next() {
  if (isLast.value) {
    emit('complete', firstTryResults.value)
    return
  }
  index.value += 1
  solved.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="font-body text-xs text-text-secondary md:text-sm">
      Exercise {{ index + 1 }} / {{ drills.length }}
    </p>

    <FillBlankExercise
      v-if="currentDrill.kind === 'fill-blank'"
      :key="currentDrill.id"
      :exercise="currentDrill"
      @solved="handleSolved"
    />
    <MultipleChoiceExercise
      v-else-if="currentDrill.kind === 'multiple-choice'"
      :key="currentDrill.id"
      :exercise="currentDrill"
      @solved="handleSolved"
    />
    <ReorderExercise
      v-else-if="currentDrill.kind === 'reorder'"
      :key="currentDrill.id"
      :exercise="currentDrill"
      @solved="handleSolved"
    />

    <div v-if="solved" class="flex justify-center">
      <PixelButton variant="primary" @click="next">
        {{ isLast ? 'Finish' : 'Next' }}
      </PixelButton>
    </div>
  </div>
</template>
