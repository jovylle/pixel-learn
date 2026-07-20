<script setup>
import HeroCard from '@/components/dashboard/HeroCard.vue'
import LearningCategoriesCard from '@/components/dashboard/LearningCategoriesCard.vue'
import ProgressCard from '@/components/dashboard/ProgressCard.vue'
import RecentActivityCard from '@/components/dashboard/RecentActivityCard.vue'
import StatsRow from '@/components/dashboard/StatsRow.vue'
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-4 p-4 md:gap-6 md:p-6">
    <HeroCard />
    <ProgressCard />
    <StatsRow />
    <LearningCategoriesCard />
    <RecentActivityCard />
  </div>
</template>
