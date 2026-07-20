<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PixelBackground from '@/components/ui/PixelBackground.vue'
import TheNavbar from '@/components/TheNavbar.vue'

const route = useRoute()
// /welcome renders full-bleed over the background with no chrome yet
// (there's no user/avatar/username to show in the navbar before it exists).
const showChrome = computed(() => route.name !== 'welcome')
</script>

<template>
  <div class="min-h-screen font-body text-text-primary">
    <PixelBackground />
    <TheNavbar v-if="showChrome" />
    <main :class="showChrome ? 'pt-16' : ''">
      <RouterView />
    </main>
  </div>
</template>
