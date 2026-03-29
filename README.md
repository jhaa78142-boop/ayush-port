# Ayush Portfolio v6 — Cinematic Edition

## What's New in This Version

### Opening Experience Upgrade
- **CinematicLoader** — Terminal boot-sequence preloader with real progress arc, scrolling system lines, name reveal with blur-in, and a wormhole collapse exit animation
- **NeuralField** — Three.js neural particle field (1,200 points morphing from random scatter → toroidal topology). Mouse parallax, scroll-reactive tilt, custom GLSL shaders, nearest-neighbor edge lines
- **Hero** — Per-character spring-physics headline animation, mouse parallax text layer, scroll blur-out, scan-line shimmer on CTA button

### New Dependencies Added
- `three` + `@types/three` — 3D scene (dynamically imported, zero FCP impact)
- `gsap` — available for future animation timelines

## Getting Started

```bash
npm install
npm run dev
```

## File Structure Changes

```
src/app/
  App.tsx                          ← updated (CinematicLoader swap)
  components/
    CinematicLoader.tsx            ← NEW (replaces Loader.tsx)
    NeuralField.tsx                ← NEW (Three.js scene)
    Hero.tsx                       ← UPGRADED
    Loader.tsx                     ← kept (can delete)
```

## Performance
- Three.js loads dynamically — no FCP impact
- Mobile: auto-detects, reduces particles 1200→380, disables edge lines
- rAF pauses when tab is hidden
- Pixel ratio capped at 2x
