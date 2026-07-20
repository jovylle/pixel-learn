<script setup>
import PixelIcon from './PixelIcon.vue'
import PixelPanel from './PixelPanel.vue'

defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
})
</script>

<template>
  <PixelPanel class="flex flex-col items-center gap-2 text-center">
    <PixelIcon :name="icon" class="text-2xl" />
    <span class="font-body text-xs md:text-sm uppercase tracking-wide text-accent-blue">{{ label }}</span>
    <span class="font-pixel text-lg md:text-xl text-text-primary">{{ value }}</span>
  </PixelPanel>
</template>
