<script setup>
import { computed } from 'vue'

import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import SlimeNPC from '@/components/ui/SlimeNPC.vue'
import { getSlimeLine } from '@/lib/gamification'
import { useAppStore } from '@/stores/app'

import ActivityList from './ActivityList.vue'

const store = useAppStore()

const slimeMessage = computed(() => getSlimeLine(store.slimeContext))
</script>

<template>
  <PixelPanel>
    <div class="mb-2 flex items-center gap-2">
      <PixelIcon name="speech-bubble" class="text-lg" />
      <h2 class="font-pixel text-xs text-text-primary md:text-sm">Recent Activity</h2>
    </div>
    <ActivityList :entries="store.recentActivity" />
    <div class="mt-2 flex justify-end">
      <SlimeNPC :message="slimeMessage" />
    </div>
  </PixelPanel>
</template>
