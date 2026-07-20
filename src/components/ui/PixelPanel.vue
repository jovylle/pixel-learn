<script setup>
// The base card of the whole theme (PLAN.md / ROUTES_AND_COMPONENTS.md):
// panel-bg @ ~87% opacity, 1-2px panel-border, 4-6px pixel corners, no blur.
defineProps({
  as: { type: String, default: 'div' },
})
</script>

<template>
  <component
    :is="as"
    class="relative bg-panel-bg/87 border border-panel-border rounded-[var(--radius-pixel)] p-4 md:p-6"
  >
    <slot />
  </component>
</template>
