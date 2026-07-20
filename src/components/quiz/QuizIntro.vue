<script setup>
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'

defineProps({
  round: { type: Object, required: true },
})

defineEmits(['start'])
</script>

<template>
  <PixelPanel class="text-center">
    <PixelIcon name="lightning" class="mb-2 text-3xl text-accent-gold" />
    <h2 class="mb-2 font-pixel text-sm text-text-primary md:text-base">{{ round.title }}</h2>
    <p class="mb-6 font-body text-sm text-text-secondary md:text-base">
      Ready? {{ round.questions.length }} questions, {{ round.perQuestionSeconds }}s each.
    </p>
    <PixelButton variant="primary" @click="$emit('start')">Start</PixelButton>
  </PixelPanel>
</template>
