<script setup>
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'

defineProps({
  lesson: { type: Object, required: true },
})

defineEmits(['done'])
</script>

<template>
  <PixelPanel>
    <p class="mb-4 font-body text-sm text-text-primary md:text-base">{{ lesson.explanation }}</p>
    <ul class="mb-6 flex flex-col gap-2">
      <li
        v-for="(example, i) in lesson.examples"
        :key="i"
        class="rounded-[var(--radius-pixel-sm)] border border-panel-border bg-panel-bg/60 px-3 py-2 font-body text-sm text-text-secondary md:text-base"
      >
        {{ example }}
      </li>
    </ul>
    <div class="flex justify-center">
      <PixelButton variant="primary" @click="$emit('done')">Got it</PixelButton>
    </div>
  </PixelPanel>
</template>
