<script setup>
import CharacterSprite from '@/components/ui/CharacterSprite.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <PixelPanel class="flex items-center justify-between gap-4 overflow-visible">
    <div>
      <h1 class="mb-2 font-pixel text-sm text-text-primary md:text-lg">
        Welcome back, <span class="text-accent-blue">{{ store.user?.username }}</span>! 👋
      </h1>
      <p class="max-w-md font-body text-sm text-text-secondary md:text-base">
        Ready to continue your quest? Pick a category below to keep leveling up.
      </p>
    </div>
    <CharacterSprite class="-mb-4 -mr-2 shrink-0 md:mr-0" />
  </PixelPanel>
</template>
