<script setup>
import slimeSprite from '@/assets/sprites/slime.png'

defineProps({
  message: { type: String, default: '' },
})
</script>

<template>
  <div class="flex items-end justify-end gap-2">
    <div
      v-if="message"
      class="mb-2 max-w-[12rem] rounded-[var(--radius-pixel-sm)] border border-panel-border bg-panel-bg/95 px-3 py-2 text-xs text-text-primary"
    >
      {{ message }}
    </div>
    <img
      :src="slimeSprite"
      alt=""
      class="h-11 w-auto shrink-0 select-none"
      style="image-rendering: pixelated"
      aria-hidden="true"
    />
  </div>
</template>
