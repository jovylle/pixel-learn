# pixel-learn — Pixel-Themed Learning Website

## Reference
Dashboard mock (`AFK` app): dark navy night scene, pixel castle + forest + moon
parallax background, floating semi-transparent card panels with thin blue
borders, pixel character reading a book, blue slime NPC with speech bubble in
"Recent Activity". This plan locks in that exact style.

## Tech Stack
- Vue 3 + Vite
- Tailwind CSS
- Pixel font: **Press Start 2P** for headings/logo, **Pixelify Sans** for
  body/UI text (Press Start 2P is unreadable at paragraph size)
- No backend for v1 — local component state / mock data only

## Color Palette (extracted from reference)

| Token | Hex | Usage |
|---|---|---|
| `bg-void` | `#070a1a` | Outermost background fallback behind the parallax image |
| `bg-navbar` | `#0b1230` | Top navbar strip |
| `panel-bg` | `#0e1533` (85–90% opacity) | Card panels (Hero, Progress, Stats, Categories, Activity) |
| `panel-border` | `#26315e` | 1–2px card borders (pixelated, no blur/shadow) |
| `accent-blue` | `#4f8cff` | Links, highlighted name ("urbano"), progress fill, active states |
| `text-primary` | `#f2f4fa` | Headings, primary copy |
| `text-secondary` | `#93a0c9` | Subtext, muted labels |
| `accent-gold` | `#f0b429` | Star / trophy / achievement icon accents |
| `progress-track` | `#0a0f24` | Empty progress bar track |
| `slime-blue` | `#3d7dff` | Slime NPC body |

Cards sit *on top of* the background image (not opaque blocks) — background
must be visible faintly through the panel, so use `panel-bg` at ~85-90%
opacity + `backdrop-filter: none` (keep it flat/pixel, no blur) with a crisp
1-2px border, slightly rounded (4-6px, NOT fully rounded — pixel-art corners).

## Layout (top to bottom)

```
Navbar
  ├─ hamburger icon (left)
  ├─ logo/wordmark (left, pixel font)
  └─ avatar + username + dropdown chevron (right)

Fullscreen pixel background (fixed, behind everything below)
  castle silhouette + pine forest + moon + drifting stars

Hero Card
  ├─ "Welcome back, {name}!" 👋  (name in accent-blue)
  ├─ subtext (1-2 lines, text-secondary)
  └─ character sprite (reading a book), right-aligned, overflows card edge

Progress Card
  ├─ icon + "Your Progress" heading
  ├─ horizontal progress bar (rounded pixel style, panel-bg track, accent-blue fill)
  └─ "{n}% Completed" label under bar

Stats Row (3 cards, equal width)
  ├─ Lessons        (book icon)
  ├─ Reading Time    (clock icon)
  └─ Achievements    (trophy icon)
  each: icon, label (accent-blue), big number (text-primary, bold)

Learning Categories Card
  ├─ icon + "Learning Categories" heading
  └─ grid/row of pill buttons: Book worm, Pop up Quiz!, Grammar, Listening, Speaking
     (icon + label per pill, panel-border outline, hover -> accent-blue border)

Recent Activity Card
  ├─ icon + "Recent Activity" heading
  ├─ list of entries (or "No activity yet.")
  └─ slime NPC sprite bottom-right with speech-bubble icon
```

Responsive: stats row and category grid collapse to fewer columns / stack on
mobile; background image scales via `background-size: cover` and stays fixed.

## Assets Needed

### 1. Background (castle + forest + moon + stars, layered/parallax)
Search: "pixel fantasy background", "pixel castle background", "pixel night
forest", "pixel parallax background"
Sources: itch.io ⭐, OpenGameArt, CraftPix, Kenney

### 2. Character Sprite (reads a book, matches Hero card)
Search: "pixel student sprite", "pixel RPG character", "pixel reading
animation". Can also generate with AI (prompt below).

### 3. Slime NPC (Recent Activity card)
Search: "pixel slime sprite" — very common free asset, blue variant to match
`slime-blue`.

### 4. UI Kit (panels, borders, buttons, progress bars)
Search: "pixel ui kit", "pixel fantasy ui", "pixel dialog box", "pixel rpg
ui". If a good kit isn't found, hand-roll panels with CSS borders +
`image-rendering: pixelated` box-shadows instead of importing 9-slice PNGs —
keeps v1 simpler.

### 5. Icons (book, clock, trophy, headphones, mic, star, sword, scroll, speech bubble)
Search: "pixel ui icons", "pixel rpg icons", "pixel achievement icons".
Kenney's icon packs are free and cover most of this list directly.

### 6. Avatar
Options: DiceBear Pixel Art (fast, free, API-driven), PixelMe, AI-generated
pixel portrait.

## AI Prompts (color-locked to this theme)

**Background:**
> 16-bit pixel art fantasy castle at night, deep navy-indigo sky (#070a1a to
> #0e1533), cool blue moonlight, silhouetted pine forest, layered parallax,
> scattered star sprites, SNES style, seamless wide background, no warm tones.

**UI kit:**
> 16-bit pixel RPG UI kit, dark navy fantasy theme (#0e1533 panels, #26315e
> borders, #4f8cff accent), buttons, panels, borders, progress bars,
> transparent background, flat pixel edges, no gradients.

**Character:**
> Cute pixel student character reading a book, dark blue jacket, RPG style,
> transparent background, palette matching cool navy/blue night scene.

**Slime NPC:**
> Pixel art blue slime creature, RPG mascot style, simple friendly face,
> transparent background, matches #3d7dff blue tone.

**Icons:**
> Pixel RPG icon set: book, clock, trophy, headphones, microphone, star,
> sword, scroll, speech bubble — navy/gold accent palette, transparent
> background.

## Recommendation
Pick **one** pixel-art asset pack from itch.io and source background, UI,
icons, and characters from it for visual consistency, then re-tint via CSS
`filter: hue-rotate` / recolor pass if needed to hit the exact navy/blue
palette above. The frontend build itself (Vue components, layout, state) is
the easy part — asset consistency is what will make or break the pixel-art
look.

## Build Plan
1. Scaffold Vue 3 + Vite + Tailwind project in `pixel-learn/`.
2. Add fonts (Press Start 2P, Pixelify Sans) + Tailwind theme tokens for the
   palette above.
3. Build static layout with mock data (no assets yet) to validate structure.
4. Source/generate assets per list above, drop into `src/assets/`.
5. Wire assets into components (background, character, slime, icons).
6. Responsive pass (mobile stacking).
7. `git init`, commit, create public GitHub repo `pixel-learn`, push to
   `main`.

## Open Questions
- None blocking v1 — mock data only, no backend/auth for this iteration.

## See Also (expanded specs)
This one-pager locks the visual/tech foundation. The full app scope implied by
the dashboard is broken out into these companion docs:

- **[FEATURES.md](./FEATURES.md)** — each Learning Category (Book worm, Pop up
  Quiz!, Grammar, Listening, Speaking) as a full feature spec: flows, data
  read/write, UI states, dashboard hooks.
- **[GAMIFICATION.md](./GAMIFICATION.md)** — XP/leveling, "% Completed",
  streaks, achievements (trigger conditions + example list), Recent Activity
  feed, slime/character reactions.
- **[DATA_MODEL.md](./DATA_MODEL.md)** — mock localStorage schema: User,
  Category/content items, ProgressRecord, Achievement, ActivityLogEntry.
- **[ROUTES_AND_COMPONENTS.md](./ROUTES_AND_COMPONENTS.md)** — Vue Router route
  table + per-page component trees reusing the panel/card primitives.
- **[NAVBAR_AND_PROFILE.md](./NAVBAR_AND_PROFILE.md)** — hamburger nav, avatar
  dropdown, and the Profile/Settings page (logout is a v1 no-op).
- **[ONBOARDING_AND_POLISH.md](./ONBOARDING_AND_POLISH.md)** — first-run
  naming/avatar flow, sound & music system, accessibility/motion notes, and
  what's worth unit-testing.

All companion docs inherit this file's palette, fonts, and the "mock data only,
no backend for v1" constraint; anything beyond that is explicitly labeled
future/out-of-scope.
