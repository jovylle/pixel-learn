<script setup>
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'

// Single short playback with no scrubber/speed needs — a plain <audio>
// element covers it, no need for the full useAudioPlayer composable.
defineProps({
  recordingUrl: { type: String, required: true },
})

const emit = defineEmits(['re-record'])
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <audio :src="recordingUrl" controls class="w-full max-w-sm" />
    <PixelButton @click="emit('re-record')">
      <PixelIcon name="refresh" class="text-base" /> Re-record
    </PixelButton>
  </div>
</template>
