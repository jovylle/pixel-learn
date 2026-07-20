<script setup>
import { computed } from 'vue'

import PixelIcon from '@/components/ui/PixelIcon.vue'
import { formatRelativeTime } from '@/lib/date'

const props = defineProps({
  entry: { type: Object, required: true },
})

const relativeTime = computed(() => formatRelativeTime(props.entry.createdAt))
</script>

<template>
  <li class="flex items-center gap-3 py-2">
    <PixelIcon :name="entry.icon" class="text-lg" />
    <div class="min-w-0 flex-1">
      <p class="truncate font-body text-sm text-text-primary">{{ entry.message }}</p>
    </div>
    <span class="shrink-0 font-body text-xs text-text-secondary">{{ relativeTime }}</span>
  </li>
</template>
