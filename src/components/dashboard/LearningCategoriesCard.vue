<script setup>
import CategoryPill from '@/components/ui/CategoryPill.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <PixelPanel>
    <div class="mb-3 flex items-center gap-2">
      <PixelIcon name="sword" class="text-lg" />
      <h2 class="font-pixel text-xs text-text-primary md:text-sm">Learning Categories</h2>
    </div>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
      <CategoryPill
        v-for="category in store.content.categories"
        :key="category.id"
        :icon="category.icon"
        :label="category.label"
        :to="category.route"
      />
    </div>
  </PixelPanel>
</template>
