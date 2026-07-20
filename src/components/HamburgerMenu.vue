<script setup>
import { ref } from 'vue'
import { onClickOutside } from '@/lib/onClickOutside'
import PixelIcon from '@/components/ui/PixelIcon.vue'

const open = ref(false)
const root = ref(null)
onClickOutside(root, () => (open.value = false))

const items = [
  { label: 'Dashboard', icon: 'castle', to: '/' },
  { label: 'Book worm', icon: 'book', to: '/bookworm' },
  { label: 'Pop up Quiz!', icon: 'lightning', to: '/quiz' },
  { label: 'Grammar', icon: 'pencil', to: '/grammar' },
  { label: 'Listening', icon: 'headphones', to: '/listening' },
  { label: 'Speaking', icon: 'mic', to: '/speaking' },
  { label: 'Achievements', icon: 'trophy', to: '/achievements' },
]

function close() {
  open.value = false
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-[var(--radius-pixel-sm)] border border-panel-border text-text-primary hover:border-accent-blue hover:text-accent-blue"
      aria-label="Open navigation menu"
      @click="open = !open"
      @keydown.esc="close"
    >
      <PixelIcon name="menu" class="text-base" />
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-11 z-20 w-56 rounded-[var(--radius-pixel)] border border-panel-border bg-panel-bg/95 p-2 shadow-lg"
    >
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2 rounded-[var(--radius-pixel-sm)] px-3 py-2 text-sm text-text-primary hover:text-accent-blue"
        active-class="text-accent-blue border-l-2 border-accent-blue"
        @click="close"
      >
        <PixelIcon :name="item.icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
      <div class="my-1 border-t border-panel-border" />
      <RouterLink
        to="/profile"
        class="flex items-center gap-2 rounded-[var(--radius-pixel-sm)] px-3 py-2 text-sm text-text-primary hover:text-accent-blue"
        @click="close"
      >
        <PixelIcon name="gear" />
        <span>Settings</span>
      </RouterLink>
    </div>
  </div>
</template>
