<script setup>
import nightScene from '@/assets/bg/night-scene.jpg'
</script>

<template>
  <div
    class="fixed inset-0 -z-10 overflow-hidden bg-void bg-cover bg-center"
    :style="{ backgroundImage: `url(${nightScene})` }"
    aria-hidden="true"
  />
</template>
