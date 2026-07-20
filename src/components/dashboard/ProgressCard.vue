<script setup>
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import PixelProgressBar from '@/components/ui/PixelProgressBar.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <PixelPanel>
    <div class="mb-3 flex items-center gap-2">
      <PixelIcon name="scroll" class="text-lg" />
      <h2 class="font-pixel text-xs text-text-primary md:text-sm">Your Progress</h2>
    </div>
    <PixelProgressBar :percent="store.percentCompletedValue" />
    <p class="mt-2 font-body text-sm text-text-secondary">{{ store.percentCompletedValue }}% Completed</p>
  </PixelPanel>
</template>
