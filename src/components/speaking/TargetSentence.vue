<script setup>
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'

const props = defineProps({
  targetText: { type: String, required: true },
  referenceAudioSrc: { type: String, default: null },
})

function playReference() {
  // Plain <audio> one-shot — no scrubber/speed needed for a reference clip.
  new Audio(props.referenceAudioSrc).play().catch(() => {})
}
</script>

<template>
  <PixelPanel class="text-center">
    <p class="mb-3 font-body text-base text-text-primary md:text-lg">"{{ targetText }}"</p>
    <PixelButton v-if="referenceAudioSrc" @click="playReference">
      <PixelIcon name="headphones" class="text-base" /> Hear it first
    </PixelButton>
  </PixelPanel>
</template>
