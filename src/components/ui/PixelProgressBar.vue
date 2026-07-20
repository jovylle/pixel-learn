<script setup>
const props = defineProps({
  percent: { type: Number, required: true },
})
const clamped = () => Math.min(100, Math.max(0, props.percent))
</script>

<template>
  <div
    class="w-full h-4 bg-progress-track border border-panel-border rounded-[var(--radius-pixel-sm)] overflow-hidden"
    role="progressbar"
    :aria-valuenow="clamped()"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="h-full bg-accent-blue transition-[width] duration-500" :style="{ width: clamped() + '%' }" />
  </div>
</template>
