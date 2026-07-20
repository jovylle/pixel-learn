<script setup>
import { useRoute } from 'vue-router'

import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'

const route = useRoute()
</script>

<template>
  <div class="mx-auto max-w-2xl p-4 md:p-6">
    <PixelPanel class="text-center">
      <PixelIcon v-if="route.meta.icon" :name="route.meta.icon" class="mb-3 text-3xl" />
      <h1 class="mb-2 font-pixel text-sm text-text-primary md:text-base">{{ route.meta.title }}</h1>
      <p class="mb-6 font-body text-sm text-text-secondary">
        Coming soon — this quest is still being built.
      </p>
      <PixelButton as="RouterLink" to="/">← Back to Dashboard</PixelButton>
    </PixelPanel>
  </div>
</template>
