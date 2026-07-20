<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import PixelButton from '@/components/ui/PixelButton.vue'
import PixelIcon from '@/components/ui/PixelIcon.vue'
import PixelPanel from '@/components/ui/PixelPanel.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()

// Small static list of pixel-y suggested names (ONBOARDING_AND_POLISH.md
// — no real name-generator needed for v1).
const NAME_SUGGESTIONS = ['urbano', 'pip', 'luma', 'sage', 'nox', 'quill']

// Six placeholder avatar "seeds". TODO: swap for real DiceBear Pixel Art API
// calls (`https://api.dicebear.com/.../pixel-art/svg?seed={seed}`) once
// wired up — the seed string is already the exact contract DiceBear expects.
const AVATAR_SEEDS = ['urbano', 'luma', 'pip', 'saga', 'nox', 'ember']

function seedColor(seed) {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  return `hsl(${hash}, 55%, 42%)`
}

const username = ref(NAME_SUGGESTIONS[Math.floor(Math.random() * NAME_SUGGESTIONS.length)])
const avatarSeed = ref(AVATAR_SEEDS[0])

function shuffleName() {
  username.value = NAME_SUGGESTIONS[Math.floor(Math.random() * NAME_SUGGESTIONS.length)]
}

function beginQuest() {
  const finalUsername = username.value.trim() || NAME_SUGGESTIONS[0]
  store.createUser({ username: finalUsername, avatarSeed: avatarSeed.value })
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <PixelPanel class="w-full max-w-md">
      <h1 class="mb-2 font-pixel text-base text-text-primary md:text-lg">Welcome, adventurer!</h1>
      <p class="mb-6 font-body text-sm text-text-secondary">
        Name yourself and pick an avatar to begin your quest.
      </p>

      <label class="mb-1 block font-body text-xs uppercase tracking-wide text-accent-blue">Username</label>
      <div class="mb-2 flex gap-2">
        <input
          v-model="username"
          type="text"
          maxlength="20"
          class="flex-1 rounded-[var(--radius-pixel-sm)] border border-panel-border bg-panel-bg px-3 py-2 font-body text-sm text-text-primary outline-none focus-visible:border-accent-blue"
          placeholder="Choose a name"
        />
        <PixelButton type="button" @click="shuffleName"><PixelIcon name="dice" class="text-base" /></PixelButton>
      </div>
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="name in NAME_SUGGESTIONS"
          :key="name"
          type="button"
          class="rounded-[var(--radius-pixel-sm)] border border-panel-border px-2 py-1 text-xs text-text-secondary hover:border-accent-blue hover:text-accent-blue"
          @click="username = name"
        >
          {{ name }}
        </button>
      </div>

      <label class="mb-2 block font-body text-xs uppercase tracking-wide text-accent-blue">Avatar</label>
      <div class="mb-6 flex flex-wrap gap-3">
        <!-- TODO: replace swatches with real DiceBear pixel-art avatar renders -->
        <button
          v-for="seed in AVATAR_SEEDS"
          :key="seed"
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-[var(--radius-pixel-sm)] border-2 text-lg transition-colors"
          :class="avatarSeed === seed ? 'border-accent-blue' : 'border-panel-border'"
          :style="{ background: seedColor(seed) }"
          :aria-label="`Avatar ${seed}`"
          @click="avatarSeed = seed"
        >
          🙂
        </button>
      </div>

      <PixelButton variant="primary" class="w-full" @click="beginQuest">Begin Quest</PixelButton>
    </PixelPanel>
  </div>
</template>
