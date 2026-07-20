<script setup>
defineProps({
  level: { type: Number, required: true },
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-[var(--radius-pixel-sm)] border border-accent-gold bg-panel-bg px-2 py-1 font-pixel text-[10px] text-accent-gold"
  >
    LV {{ level }}
  </span>
</template>
