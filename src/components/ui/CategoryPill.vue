<script setup>
import { RouterLink } from 'vue-router'

import PixelIcon from './PixelIcon.vue'

defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  to: { type: String, required: true },
})
</script>

<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-[var(--radius-pixel-sm)] border-2 border-panel-border bg-panel-bg/60 font-body text-sm text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
    active-class="border-accent-blue text-accent-blue"
  >
    <PixelIcon :name="icon" class="text-lg" />
    <span>{{ label }}</span>
  </RouterLink>
</template>
