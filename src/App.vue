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
    <footer v-if="showChrome" class="relative py-6 text-center font-body text-xs text-text-secondary">
      <a href="https://pixel-learn.uft1.com" class="hover:text-accent-blue">pixel-learn.uft1.com</a>
    </footer>
  </div>
</template>
