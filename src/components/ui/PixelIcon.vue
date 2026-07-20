<script setup>
import { iconFor } from '@/lib/icons'

const props = defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <img
    v-if="iconFor(props.name)"
    :src="iconFor(props.name)"
    :alt="props.name"
    class="inline-block h-[1em] w-[1em] shrink-0 select-none object-contain align-middle"
    style="image-rendering: pixelated"
    aria-hidden="true"
  />
  <span v-else class="inline-block leading-none" aria-hidden="true">❔</span>
</template>
