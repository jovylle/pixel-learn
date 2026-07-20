<script setup>
import characterSprite from '@/assets/sprites/character.png'
</script>

<template>
  <img
    :src="characterSprite"
    alt=""
    class="h-28 w-auto select-none md:h-36"
    style="image-rendering: pixelated"
    aria-hidden="true"
  />
</template>
