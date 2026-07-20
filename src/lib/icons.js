// Pixel icon key -> real pixel-art icon asset (src/assets/icons/*.png,
// generated per PLAN.md's "Icons" asset list). Every call site only ever
// references the icon *key*, so the underlying asset can change without
// touching a component.
import achievement from '@/assets/icons/achievement.png'
import book from '@/assets/icons/book.png'
import castle from '@/assets/icons/castle.png'
import chevron from '@/assets/icons/chevron.png'
import clock from '@/assets/icons/clock.png'
import dice from '@/assets/icons/dice.png'
import door from '@/assets/icons/door.png'
import gear from '@/assets/icons/gear.png'
import headphones from '@/assets/icons/headphones.png'
import lessonComplete from '@/assets/icons/lesson-complete.png'
import levelUp from '@/assets/icons/level-up.png'
import lightning from '@/assets/icons/lightning.png'
import menu from '@/assets/icons/menu.png'
import mic from '@/assets/icons/mic.png'
import pencil from '@/assets/icons/pencil.png'
import refresh from '@/assets/icons/refresh.png'
import scroll from '@/assets/icons/scroll.png'
import speechBubble from '@/assets/icons/speech-bubble.png'
import star from '@/assets/icons/star.png'
import streakMilestone from '@/assets/icons/streak-milestone.png'
import sword from '@/assets/icons/sword.png'
import trophy from '@/assets/icons/trophy.png'
import user from '@/assets/icons/user.png'

export const ICONS = {
  book,
  clock,
  trophy,
  headphones,
  mic,
  star,
  sword,
  scroll,
  'speech-bubble': speechBubble,
  home: castle,
  castle,
  lightning,
  pencil,
  gear,
  refresh,
  door,
  user,
  chevron,
  'lesson-complete': lessonComplete,
  'level-up': levelUp,
  achievement,
  'streak-milestone': streakMilestone,
  menu,
  dice,
}

export function iconFor(key) {
  return ICONS[key] ?? null
}
