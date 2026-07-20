<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import LevelBadge from '@/components/ui/LevelBadge.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelProgressBar from '@/components/ui/PixelProgressBar.vue'
import { onClickOutside } from '@/lib/onClickOutside'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()

const open = ref(false)
const root = ref(null)
onClickOutside(root, () => (open.value = false))

const xpPercent = computed(() =>
  store.xpForNext ? Math.round((store.xpIntoLevel / store.xpForNext) * 100) : 0,
)

function close() {
  open.value = false
}

function goTo(name) {
  router.push({ name })
  close()
}

function handleReset() {
  // eslint-disable-next-line no-alert
  if (confirm('Reset all progress? This clears XP, streak, achievements and activity.')) {
    store.resetProgress()
  }
  close()
}

function handleLogout() {
  // No-op in v1 — single local user, no auth (NAVBAR_AND_PROFILE.md).
  // eslint-disable-next-line no-alert
  alert('Log out is not available in v1 — there is only one local profile.')
  close()
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-[var(--radius-pixel-sm)] border border-transparent px-2 py-1 text-text-primary hover:border-panel-border"
      @click="open = !open"
    >
      <span
        class="flex h-7 w-7 items-center justify-center rounded-full text-sm"
        :style="{ background: `hsl(${(store.user?.avatarSeed?.length ?? 0) * 37}, 55%, 40%)` }"
      >
        🙂
      </span>
      <span class="hidden text-sm font-body sm:inline">{{ store.user?.username }}</span>
      <PixelIcon name="chevron" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-11 z-20 w-64 rounded-[var(--radius-pixel)] border border-panel-border bg-panel-bg/95 p-3 shadow-lg"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="font-body text-sm text-text-primary">{{ store.user?.username }}</span>
        <LevelBadge :level="store.level" />
      </div>
      <PixelProgressBar :percent="xpPercent" />
      <p class="mt-1 text-[11px] text-text-secondary">{{ store.xpIntoLevel }} / {{ store.xpForNext }} XP</p>

      <div class="my-3 border-t border-panel-border" />

      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-[var(--radius-pixel-sm)] px-2 py-2 text-sm text-text-primary hover:text-accent-blue"
        @click="goTo('profile')"
      >
        <PixelIcon name="user" /> Profile
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-[var(--radius-pixel-sm)] px-2 py-2 text-sm text-text-primary hover:text-accent-blue"
        @click="goTo('profile')"
      >
        <PixelIcon name="gear" /> Settings
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-[var(--radius-pixel-sm)] px-2 py-2 text-sm text-text-primary hover:text-accent-blue"
        @click="handleReset"
      >
        <PixelIcon name="refresh" /> Reset progress
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-[var(--radius-pixel-sm)] px-2 py-2 text-sm text-text-secondary hover:text-accent-blue"
        @click="handleLogout"
      >
        <PixelIcon name="door" /> Log out
      </button>
    </div>
  </div>
</template>
