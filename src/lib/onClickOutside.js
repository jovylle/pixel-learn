import { onBeforeUnmount, onMounted } from 'vue'

/** Small composable: run `handler` on a click/tap outside `targetRef.value`. */
export function onClickOutside(targetRef, handler) {
  function listener(event) {
    const el = targetRef.value
    if (el && !el.contains(event.target)) handler(event)
  }
  onMounted(() => document.addEventListener('click', listener))
  onBeforeUnmount(() => document.removeEventListener('click', listener))
}
