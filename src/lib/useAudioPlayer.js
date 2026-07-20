import { onBeforeUnmount, ref } from 'vue'

/**
 * Native <audio>-backed player composable per AUDIO_ASSETS_AND_MEDIA.md §2 —
 * play/pause/scrubber/replay/speed for the Listening clip player. No library:
 * a single HTMLAudioElement covers everything this app needs.
 *
 * The Audio instance is created lazily on first play() (or first interaction
 * that requires it), not on mount, so browsing the clip list never triggers
 * a network request for audio nobody opened yet.
 */
export function useAudioPlayer(src) {
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playbackRate = ref(1)
  const hasError = ref(false)

  let audio = null

  function ensureAudio() {
    if (audio) return audio
    audio = new Audio(src)
    audio.playbackRate = playbackRate.value
    audio.addEventListener('loadedmetadata', () => {
      duration.value = audio.duration || 0
    })
    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio.currentTime
    })
    audio.addEventListener('ended', () => {
      isPlaying.value = false
    })
    audio.addEventListener('error', () => {
      hasError.value = true
      isPlaying.value = false
    })
    return audio
  }

  function play() {
    if (hasError.value) return
    ensureAudio()
      .play()
      .then(() => {
        isPlaying.value = true
      })
      .catch(() => {
        hasError.value = true
        isPlaying.value = false
      })
  }

  function pause() {
    audio?.pause()
    isPlaying.value = false
  }

  function toggle() {
    if (isPlaying.value) pause()
    else play()
  }

  function seek(seconds) {
    ensureAudio()
    audio.currentTime = seconds
    currentTime.value = seconds
  }

  function replay() {
    seek(0)
    play()
  }

  function setRate(rate) {
    playbackRate.value = rate
    if (audio) audio.playbackRate = rate
  }

  onBeforeUnmount(() => {
    // No persistent mini-player in this app — leaving the Player view must
    // never leave audio playing in the background.
    if (audio) {
      audio.pause()
      audio = null
    }
  })

  return {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    hasError,
    play,
    pause,
    toggle,
    seek,
    replay,
    setRate,
  }
}
