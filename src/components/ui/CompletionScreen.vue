<script setup>
import { computed } from 'vue'

import { getSlimeLine } from '@/lib/gamification'

import PixelIcon from './PixelIcon.vue'
import PixelPanel from './PixelPanel.vue'
import SlimeNPC from './SlimeNPC.vue'

const props = defineProps({
  title: { type: String, default: 'Quest complete!' },
  xp: { type: Number, required: true },
  streak: { type: Object, default: null },
  achievements: { type: Array, default: () => [] },
})

const slimeMessage = computed(() =>
  getSlimeLine({
    hasActivity: true,
    justUnlockedAchievement: props.achievements.length > 0,
    streakMilestone: [3, 7, 14, 30].includes(props.streak?.current) ? props.streak.current : null,
  }),
)
</script>

<template>
  <PixelPanel class="text-center">
    <PixelIcon name="trophy" class="mb-2 text-3xl text-accent-gold" />
    <h2 class="mb-2 font-pixel text-sm text-text-primary md:text-base">{{ title }}</h2>
    <p class="mb-2 font-body text-sm text-accent-blue md:text-base">+{{ xp }} XP</p>
    <p v-if="streak" class="mb-2 font-body text-xs text-text-secondary md:text-sm">
      🔥 {{ streak.current }}-day streak
    </p>

    <ul v-if="achievements.length" class="mx-auto mb-4 flex max-w-xs flex-col gap-2">
      <li
        v-for="badge in achievements"
        :key="badge.id"
        class="flex items-center gap-2 rounded-[var(--radius-pixel-sm)] border border-accent-gold bg-panel-bg/60 px-3 py-2 text-left"
      >
        <PixelIcon name="achievement" class="text-lg text-accent-gold" />
        <div>
          <p class="font-body text-sm text-text-primary">{{ badge.title }}</p>
          <p class="font-body text-xs text-text-secondary">{{ badge.description }}</p>
        </div>
      </li>
    </ul>

    <div class="mb-4 flex justify-center">
      <SlimeNPC :message="slimeMessage" />
    </div>

    <slot name="next" />
  </PixelPanel>
</template>
