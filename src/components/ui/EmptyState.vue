<script setup>
defineProps({
  message: { type: String, required: true },
})
</script>

<template>
  <div class="py-8 text-center font-body text-sm text-text-secondary">
    <p>{{ message }}</p>
    <slot />
  </div>
</template>
