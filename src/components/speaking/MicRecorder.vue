<script setup>
import { onBeforeUnmount, ref } from 'vue'

import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'

// Focused purely on recording: request mic access, run MediaRecorder, emit
// the finished Blob + object URL on stop. Permission-denied / unsupported
// browsers are surfaced via 'permission-denied' so the parent view owns the
// degraded-mode fallback UI (per AUDIO_ASSETS_AND_MEDIA.md §3 boundary).
const emit = defineEmits(['recorded', 'permission-denied'])

const isRecording = ref(false)
const isRequesting = ref(false)

let mediaRecorder = null
let stream = null
let chunks = []

async function startRecording() {
  if (isRequesting.value || isRecording.value) return
  isRequesting.value = true
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    chunks = []
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    })
    mediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })
      const url = URL.createObjectURL(blob)
      emit('recorded', { blob, url })
      stopStream()
    })
    mediaRecorder.start()
    isRecording.value = true
  } catch {
    // Denied permission, no mic, or MediaRecorder unsupported — all degrade
    // to the same "practice without recording" fallback. If getUserMedia
    // succeeded but MediaRecorder construction failed, the stream is still
    // live — stop it so the mic indicator doesn't stay on.
    stopStream()
    emit('permission-denied')
  } finally {
    isRequesting.value = false
  }
}

function stopRecording() {
  if (!isRecording.value) return
  mediaRecorder?.stop()
  isRecording.value = false
}

function stopStream() {
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  mediaRecorder = null
}

onBeforeUnmount(() => {
  stopStream()
})
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <PixelButton
      variant="primary"
      :disabled="isRequesting"
      class="!rounded-full !p-6"
      :class="isRecording ? 'animate-pulse' : ''"
      @click="isRecording ? stopRecording() : startRecording()"
    >
      <PixelIcon name="mic" class="text-2xl" />
    </PixelButton>
    <p class="font-body text-xs text-text-secondary md:text-sm">
      {{ isRecording ? 'Recording… tap to stop' : 'Tap to record' }}
    </p>
  </div>
</template>
