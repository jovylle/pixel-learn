<script setup>
import PixelButton from '@/components/ui/PixelButton.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import SlimeNPC from '@/components/ui/SlimeNPC.vue'
</script>

<template>
  <div class="mx-auto max-w-2xl p-4 md:p-6">
    <PixelPanel class="text-center">
      <h1 class="mb-2 font-pixel text-sm text-text-primary md:text-base">404 — lost in the dungeon</h1>
      <p class="mb-6 font-body text-sm text-text-secondary">This path doesn't lead anywhere yet.</p>
      <div class="mb-4 flex justify-center">
        <SlimeNPC message="Wrong way, adventurer!" />
      </div>
      <PixelButton as="RouterLink" to="/">← Back to Dashboard</PixelButton>
    </PixelPanel>
  </div>
</template>
