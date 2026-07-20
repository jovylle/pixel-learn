<script setup>
import HamburgerMenu from './HamburgerMenu.vue'
import UserMenu from './UserMenu.vue'
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-navbar px-4 md:px-6">
    <div class="flex items-center gap-4">
      <HamburgerMenu />
      <RouterLink to="/" class="font-pixel text-xs text-text-primary md:text-sm">pixel-learn</RouterLink>
    </div>
    <UserMenu />
  </header>
</template>
