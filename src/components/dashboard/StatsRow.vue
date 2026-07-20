<script setup>
import StatCard from '@/components/ui/StatCard.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <StatCard icon="book" label="Lessons" :value="store.lessonsCount" />
    <StatCard icon="clock" label="Reading Time" :value="`${store.readingHours.toFixed(1)}h`" />
    <StatCard icon="trophy" label="Achievements" :value="store.achievementsCount" />
  </div>
</template>
