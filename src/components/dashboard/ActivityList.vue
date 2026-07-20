<script setup>
import ActivityItem from './ActivityItem.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

defineProps({
  entries: { type: Array, required: true },
})
</script>

<template>
  <EmptyState v-if="!entries.length" message="No activity yet — start a quest!" />
  <ul v-else class="divide-y divide-panel-border/60">
    <ActivityItem v-for="entry in entries" :key="entry.id" :entry="entry" />
  </ul>
</template>
