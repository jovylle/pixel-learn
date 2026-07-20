<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import CompletionScreen from '@/components/ui/CompletionScreen.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MCQuestionCard from '@/components/ui/MCQuestionCard.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const store = useAppStore()

const book = computed(() => store.content.bookworm.find((b) => b.id === route.params.id))

const step = ref('reading') // 'reading' | 'comprehension' | 'complete'
const startedAt = ref(Date.now())
const readingSeconds = ref(0)

const FONT_SIZES = ['text-sm', 'text-base', 'text-lg']
const fontSizeIndex = ref(1)
const fontSizeClass = computed(() => FONT_SIZES[fontSizeIndex.value])

onMounted(() => {
  startedAt.value = Date.now()
})

function increaseFontSize() {
  fontSizeIndex.value = Math.min(FONT_SIZES.length - 1, fontSizeIndex.value + 1)
}
function decreaseFontSize() {
  fontSizeIndex.value = Math.max(0, fontSizeIndex.value - 1)
}

function finishReading() {
  readingSeconds.value = Math.round((Date.now() - startedAt.value) / 1000)
  answers.value = book.value.questions.map(() => null)
  step.value = 'comprehension'
}

const answers = ref([])
const unlockedAchievements = ref([])

const allAnswered = computed(() => answers.value.length > 0 && answers.value.every((a) => a !== null))

const score = computed(() => {
  if (!book.value || !answers.value.length) return 0
  const correct = book.value.questions.filter((q, i) => answers.value[i] === q.correctIndex).length
  return Math.round((correct / book.value.questions.length) * 100)
})

const xpEarned = computed(() => 20 + Math.round((score.value / 100) * 15))

function selectAnswer(index, optionIndex) {
  if (answers.value[index] !== null) return
  answers.value[index] = optionIndex
}

function submitComprehension() {
  const before = store.achievements.filter((a) => a.unlockedAt).map((a) => a.id)
  store.recordCompletion({
    itemId: book.value.id,
    category: 'bookworm',
    bestScore: score.value,
    message: `Finished reading ${book.value.title}`,
    xp: xpEarned.value,
    readingSeconds: readingSeconds.value,
  })
  unlockedAchievements.value = store.achievements.filter(
    (a) => a.unlockedAt && !before.includes(a.id),
  )
  step.value = 'complete'
}

const nextBook = computed(() => {
  const list = store.content.bookworm
  const currentIndex = list.findIndex((b) => b.id === book.value?.id)
  for (let i = currentIndex + 1; i < list.length; i += 1) {
    const isComplete = store.progress.some((p) => p.itemId === list[i].id && p.status === 'complete')
    if (!isComplete) return list[i]
  }
  return null
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <EmptyState v-if="!book" message="Couldn't load this book.">
      <PixelButton as="RouterLink" to="/bookworm" class="mt-3">← Back to Library</PixelButton>
    </EmptyState>

    <template v-else>
      <div class="mb-4 flex items-center justify-between">
        <h1 class="flex items-center gap-2 font-pixel text-sm text-text-primary md:text-base">
          <PixelIcon name="book" class="text-xl" /> {{ book.title }}
        </h1>
        <RouterLink to="/bookworm" class="font-body text-sm text-text-secondary hover:text-accent-blue">
          ← Library
        </RouterLink>
      </div>

      <PixelPanel v-if="step === 'reading'">
        <div class="mb-3 flex items-center justify-end gap-2">
          <PixelButton :disabled="fontSizeIndex === 0" @click="decreaseFontSize">A-</PixelButton>
          <PixelButton :disabled="fontSizeIndex === FONT_SIZES.length - 1" @click="increaseFontSize">A+</PixelButton>
        </div>
        <p class="whitespace-pre-line font-body text-text-primary" :class="fontSizeClass">{{ book.body }}</p>
        <div class="mt-6 flex justify-center">
          <PixelButton variant="primary" @click="finishReading">I'm done reading</PixelButton>
        </div>
      </PixelPanel>

      <div v-else-if="step === 'comprehension'" class="flex flex-col gap-4">
        <MCQuestionCard
          v-for="(question, index) in book.questions"
          :key="question.id"
          :question="question"
          :selected-index="answers[index]"
          :answered="answers[index] !== null"
          @select="(optionIndex) => selectAnswer(index, optionIndex)"
        />
        <div class="flex justify-center">
          <PixelButton variant="primary" :disabled="!allAnswered" @click="submitComprehension">
            Submit
          </PixelButton>
        </div>
      </div>

      <CompletionScreen
        v-else
        :title="`Finished ${book.title}!`"
        :xp="xpEarned"
        :streak="store.user?.streak"
        :achievements="unlockedAchievements"
      >
        <template #next>
          <PixelButton v-if="nextBook" as="RouterLink" :to="`/bookworm/${nextBook.id}`" variant="primary">
            Next book: {{ nextBook.title }}
          </PixelButton>
          <PixelButton v-else as="RouterLink" to="/bookworm" variant="primary">Back to Library</PixelButton>
        </template>
      </CompletionScreen>
    </template>
  </div>
</template>
