<script setup>
defineProps({
  variant: { type: String, default: 'default' }, // 'default' | 'primary'
  as: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <component
    :is="as"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-pixel-sm)] border-2 font-body text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :class="
      variant === 'primary'
        ? 'bg-accent-blue border-accent-blue text-void hover:brightness-110'
        : 'bg-panel-bg/70 border-panel-border text-text-primary hover:border-accent-blue hover:text-accent-blue'
    "
  >
    <slot />
  </component>
</template>
