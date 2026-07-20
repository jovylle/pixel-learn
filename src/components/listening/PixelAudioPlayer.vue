<script setup>
// Pixel-styled audio player per FEATURES.md §4 / ROUTES_AND_COMPONENTS.md.
// Handles the v1 reality that no real audio files exist yet (see
// AUDIO_ASSETS_AND_MEDIA.md): if the underlying <audio> element fires an
// `error` event (missing/failed-to-load src), we degrade to a text-only
// "read the transcript" mode instead of showing a broken/silent player.
import { computed, ref, watch } from 'vue'

import PixelButton from '@/components/ui/PixelButton.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import { useAudioPlayer } from '@/lib/useAudioPlayer'

const props = defineProps({
  src: { type: String, required: true },
  transcript: { type: String, required: true },
  fallbackDurationSeconds: { type: Number, default: 0 },
})

const player = useAudioPlayer(props.src)
const showTranscript = ref(false)

// Transcript is hidden by default per FEATURES.md's "keep it a listening
// test" — but if audio can't play at all, there's nothing to listen to, so
// auto-reveal it and lead with the fallback banner instead of a dead player.
watch(
  player.hasError,
  (errored) => {
    if (errored) showTranscript.value = true
  },
  { immediate: true },
)

const durationDisplay = computed(() => player.duration.value || props.fallbackDurationSeconds)

function formatTime(seconds) {
  const total = Math.max(0, Math.round(seconds || 0))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function onScrub(event) {
  player.seek(Number(event.target.value))
}

function toggleRate() {
  player.setRate(player.playbackRate.value === 1 ? 0.75 : 1)
}
</script>

<template>
  <PixelPanel>
    <div v-if="player.hasError.value" class="mb-4 rounded-[var(--radius-pixel-sm)] border border-accent-gold bg-panel-bg/60 p-3">
      <p class="font-body text-sm text-accent-gold">
        🔇 Audio unavailable — this clip's audio hasn't been recorded yet.
      </p>
      <p class="mt-1 font-body text-xs text-text-secondary">
        You can still complete this quest by reading the transcript below.
      </p>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <PixelButton variant="primary" @click="player.toggle">
          {{ player.isPlaying.value ? '⏸ Pause' : '▶ Play' }}
        </PixelButton>
        <PixelButton @click="player.replay">↻ Replay</PixelButton>
        <PixelButton @click="toggleRate">{{ player.playbackRate.value }}×</PixelButton>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-10 shrink-0 font-body text-xs text-text-secondary">{{ formatTime(player.currentTime.value) }}</span>
        <input
          type="range"
          min="0"
          :max="durationDisplay || 0"
          step="1"
          :value="player.currentTime.value"
          class="w-full accent-accent-blue"
          @input="onScrub"
        />
        <span class="w-10 shrink-0 text-right font-body text-xs text-text-secondary">{{ formatTime(durationDisplay) }}</span>
      </div>
    </div>

    <div class="mt-4">
      <PixelButton v-if="!player.hasError.value" @click="showTranscript = !showTranscript">
        {{ showTranscript ? 'Hide transcript' : 'Show transcript' }}
      </PixelButton>
      <p
        v-if="showTranscript"
        class="mt-3 whitespace-pre-line rounded-[var(--radius-pixel-sm)] border border-panel-border bg-panel-bg/60 p-3 font-body text-sm text-text-primary"
      >
        {{ transcript }}
      </p>
    </div>
  </PixelPanel>
</template>
