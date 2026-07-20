# pixel-learn — Navbar & Profile

Details the top navbar (hamburger menu, wordmark logo, avatar/username
dropdown) and the Profile/Settings page. Consistent with PLAN.md palette
(`bg-navbar #0b1230`, `accent-blue`, pixel fonts) and the "mock data, no
backend" v1 constraint.

## Navbar layout (from PLAN.md)

```
TheNavbar.vue   (bg-navbar strip, full width, fixed top)
├─ left:   HamburgerMenu.vue   (☰ icon → slide-out / dropdown nav)
├─ left:   Logo/wordmark        ("pixel-learn", Press Start 2P, links to /)
└─ right:  UserMenu.vue         (avatar + username + chevron → dropdown)
```

Reference used "AFK" as the wordmark; this project's wordmark is
**"pixel-learn"** (Press Start 2P). Keep it compact so it fits the pixel font at
navbar height.

## Hamburger menu (`HamburgerMenu.vue`)

Opens a pixel-panel slide-out (left) / dropdown on mobile. Contents = primary
navigation to every feature + top-level pages. Each item = `CategoryPill` /
row with a pixel icon.

| Item | Icon | Route |
|---|---|---|
| Dashboard | home / castle | `/` |
| Book worm | book | `/bookworm` |
| Pop up Quiz! | lightning / star | `/quiz` |
| Grammar | scroll / pencil | `/grammar` |
| Listening | headphones | `/listening` |
| Speaking | microphone | `/speaking` |
| Achievements | trophy | `/achievements` |
| — divider — | | |
| Settings | gear | `/profile` (settings section) |

- Active route highlighted with `accent-blue` border/text.
- Closes on selection and on outside-click / Esc.
- On desktop the menu may render as a dropdown panel; on mobile a full-height
  slide-out over a dimmed background.

## Avatar / username dropdown (`UserMenu.vue`)

Trigger: avatar (DiceBear pixel-art from `User.avatarSeed`) + `username` +
chevron. Opens a small pixel-panel dropdown.

| Item | Icon | Action |
|---|---|---|
| Profile | user | Navigate to `/profile` |
| Settings | gear | Navigate to `/profile` (settings section / tab) |
| Reset progress | refresh | Dev/util: clears mock store + re-seeds (confirm first) |
| Log out | door | **No-op in v1** — shows a "not available in v1" toast or is hidden; kept for layout parity with the reference |

- Header of the dropdown shows username, level chip (`LevelBadge`), and a mini
  XP bar (nice-to-have).
- Closes on selection / outside-click / Esc.

> **Log out is intentionally inert in v1** — there is a single local user and no
> auth (see `DATA_MODEL.md`). Include it for visual parity with the AFK
> reference, but wire it to a friendly no-op. Real auth/logout is
> **future / out of scope for v1**.

## Profile / Settings page (`/profile`)

Single page combining profile display + editable settings (no separate
`/settings` route needed for v1).

### Profile section (`ProfileCard.vue`)
- Avatar (from `avatarSeed`), `displayName` / `username`.
- `LevelBadge` + XP progress toward next level.
- Streak (current / longest, with a flame icon).
- Totals: lessons completed, reading time (hours), achievements unlocked.
- Small recent-achievements strip (links to `/achievements`).

### Settings section (`SettingsPanel.vue`)
All persist to the local store (`DATA_MODEL.md`):

| Setting | Control | Effect |
|---|---|---|
| Username / display name | text input | Updates `User.username` (drives Hero greeting + navbar) |
| Avatar | seed input / "randomize" | Updates `User.avatarSeed` (DiceBear) |
| Default reading font size | small/med/large toggle | Default for Book worm reader |
| Sound | on/off toggle | SFX + ambient music mute (see `ONBOARDING_AND_POLISH.md`); SFX default on, music default off |
| Reset progress | button (confirm modal) | Clears `progress`/`activity`, re-locks achievements, resets XP/streak, re-seeds |

> **Future / out of scope for v1:** account email, password, theme switching
> (only the one navy theme exists), notification prefs, data export/import,
> real sign-in. Settings in v1 are cosmetic + a reset button.
