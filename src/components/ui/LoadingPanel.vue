<script setup>
defineProps({
  message: { type: String, default: 'Loading...' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-10 font-body text-sm text-text-secondary">
    <div class="flex gap-1" aria-hidden="true">
      <span class="h-3 w-3 animate-pulse bg-accent-blue [animation-delay:0ms]" />
      <span class="h-3 w-3 animate-pulse bg-accent-blue [animation-delay:150ms]" />
      <span class="h-3 w-3 animate-pulse bg-accent-blue [animation-delay:300ms]" />
    </div>
    <p>{{ message }}</p>
  </div>
</template>
