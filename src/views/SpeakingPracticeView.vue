<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'

import MicRecorder from '@/components/speaking/MicRecorder.vue'
import RecordingPlayback from '@/components/speaking/RecordingPlayback.vue'
import SelfScore from '@/components/speaking/SelfScore.vue'
import TargetSentence from '@/components/speaking/TargetSentence.vue'
import CompletionScreen from '@/components/ui/CompletionScreen.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const store = useAppStore()

const prompt = computed(() => store.content.speaking.find((p) => p.id === route.params.id))

const step = ref('idle') // 'idle' | 'recorded' | 'complete'
const micDenied = ref(false)
const selfScore = ref(null)
const unlockedAchievements = ref([])
const recordingUrl = ref(null)

function revokeRecording() {
  if (recordingUrl.value) {
    URL.revokeObjectURL(recordingUrl.value)
    recordingUrl.value = null
  }
}

function onRecorded({ url }) {
  revokeRecording()
  recordingUrl.value = url
  step.value = 'recorded'
}

function onPermissionDenied() {
  // Degraded mode: no MediaRecorder UI at all — read-aloud + self-score only.
  micDenied.value = true
}

function reRecord() {
  revokeRecording()
  step.value = 'idle'
  selfScore.value = null
}

// 15 base + 5/10/15 bonus for 1★/2★/3★ self-rating, per GAMIFICATION.md §1.
const xpEarned = computed(() => 15 + [5, 10, 15][(selfScore.value ?? 1) - 1])

function confirmScore() {
  if (!selfScore.value) return
  const before = store.achievements.filter((a) => a.unlockedAt).map((a) => a.id)
  store.recordCompletion({
    itemId: prompt.value.id,
    category: 'speaking',
    selfScore: selfScore.value,
    message: `Practiced speaking: ${prompt.value.title}`,
    xp: xpEarned.value,
  })
  unlockedAchievements.value = store.achievements.filter(
    (a) => a.unlockedAt && !before.includes(a.id),
  )
  revokeRecording()
  step.value = 'complete'
}

const nextPrompt = computed(() => {
  const list = store.content.speaking
  const currentIndex = list.findIndex((p) => p.id === prompt.value?.id)
  for (let i = currentIndex + 1; i < list.length; i += 1) {
    const isComplete = store.progress.some((p) => p.itemId === list[i].id && p.status === 'complete')
    if (!isComplete) return list[i]
  }
  return null
})

onBeforeUnmount(() => {
  revokeRecording()
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <EmptyState v-if="!prompt" message="Couldn't load this prompt.">
      <PixelButton as="RouterLink" to="/speaking" class="mt-3">← Back to Speaking</PixelButton>
    </EmptyState>

    <template v-else>
      <div class="mb-4 flex items-center justify-between">
        <h1 class="flex items-center gap-2 font-pixel text-sm text-text-primary md:text-base">
          <PixelIcon name="mic" class="text-xl" /> {{ prompt.title }}
        </h1>
        <RouterLink to="/speaking" class="font-body text-sm text-text-secondary hover:text-accent-blue">
          ← Speaking
        </RouterLink>
      </div>

      <div v-if="step === 'idle'" class="flex flex-col gap-4">
        <TargetSentence :target-text="prompt.targetText" :reference-audio-src="prompt.referenceAudioSrc" />

        <MicRecorder v-if="!micDenied" @recorded="onRecorded" @permission-denied="onPermissionDenied" />

        <div v-else class="flex flex-col items-center gap-4">
          <p class="max-w-sm text-center font-body text-xs text-text-secondary md:text-sm">
            Couldn't access your microphone. Read the sentence aloud on your own, then rate yourself below.
          </p>
          <SelfScore v-model="selfScore" />
          <PixelButton variant="primary" :disabled="!selfScore" @click="confirmScore">Confirm</PixelButton>
        </div>
      </div>

      <div v-else-if="step === 'recorded'" class="flex flex-col gap-4">
        <TargetSentence :target-text="prompt.targetText" :reference-audio-src="prompt.referenceAudioSrc" />
        <RecordingPlayback :recording-url="recordingUrl" @re-record="reRecord" />
        <SelfScore v-model="selfScore" />
        <div class="flex justify-center">
          <PixelButton variant="primary" :disabled="!selfScore" @click="confirmScore">Confirm</PixelButton>
        </div>
      </div>

      <CompletionScreen
        v-else
        :title="`Practiced ${prompt.title}!`"
        :xp="xpEarned"
        :streak="store.user?.streak"
        :achievements="unlockedAchievements"
      >
        <template #next>
          <PixelButton v-if="nextPrompt" as="RouterLink" :to="`/speaking/${nextPrompt.id}`" variant="primary">
            Next prompt: {{ nextPrompt.title }}
          </PixelButton>
          <PixelButton v-else as="RouterLink" to="/speaking" variant="primary">Back to Speaking</PixelButton>
        </template>
      </CompletionScreen>
    </template>
  </div>
</template>
