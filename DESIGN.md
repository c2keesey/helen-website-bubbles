# Helen Johnston — Bubble Landing Page Design

## Concept

**Aesthetic Direction: Dreamy Iridescent Whimsy**

A personal portfolio that feels like catching soap bubbles on a perfect summer afternoon. The interface should evoke childlike wonder while maintaining sophistication—playful but not juvenile, magical but not kitsch.

**Core Memory**: Watching iridescent bubbles drift lazily upward against a perfect blue sky, each one carrying a secret destination.

---

## Typography

### Header: "Helen Johnston"
**Font**: [Boogaloo](https://fonts.google.com/specimen/Boogaloo) or [Baloo 2](https://fonts.google.com/specimen/Baloo+2)
- Rounded, bubbly letterforms that feel inflated
- Applied with CSS effects to achieve metallic iridescent finish:
  - Linear gradient text fill (pink → cyan → purple shift)
  - Subtle text-shadow for depth
  - Optional: CSS `background-clip: text` with animated gradient

### Navigation Subtext: "Resume, Projects, Photography, Social"
**Font**: [Quicksand](https://fonts.google.com/specimen/Quicksand) (Medium weight)
- Geometric, rounded sans-serif
- Complements bubble aesthetic without competing
- Soft, approachable, highly legible

### Bubble Labels
- Same metallic bubble treatment as header
- Smaller scale (~24-32px)
- High contrast against bubble surface

---

## Color Palette

```css
:root {
  /* Sky gradient - top to bottom */
  --sky-top: #87CEEB;        /* Light sky blue */
  --sky-mid: #B0E0F6;        /* Pale azure */
  --sky-bottom: #E0F4FF;     /* Near-white horizon */

  /* Bubble iridescence */
  --bubble-pink: #FFB6C1;
  --bubble-cyan: #7FDBFF;
  --bubble-purple: #DDA0DD;
  --bubble-white: rgba(255, 255, 255, 0.3);

  /* Metallic text gradient */
  --metal-start: #FF69B4;    /* Hot pink */
  --metal-mid: #00CED1;      /* Dark turquoise */
  --metal-end: #9370DB;      /* Medium purple */

  /* Accents */
  --highlight: rgba(255, 255, 255, 0.8);
  --shadow: rgba(0, 50, 100, 0.1);
}
```

---

## Background

**Layered Sky Composition**:
1. Base: Vertical gradient from `--sky-top` to `--sky-bottom`
2. Atmosphere: Soft radial gradient (lighter center, subtle vignette)
3. Depth: 2-3 distant, blurred decorative clouds (CSS pseudo-elements or subtle SVG)
4. Optional: Faint sun glow in upper corner (radial gradient, very subtle)

No harsh edges. Everything soft, diffused, dreamlike.

---

## Bubble Design

### Visual Structure
Each bubble is a `<div>` or canvas-rendered element with:

1. **Base sphere**: Radial gradient creating 3D depth
   - Lighter at top-left (light source)
   - Slightly darker at bottom-right

2. **Iridescent film**: Overlay gradient that shifts hue
   - Animated or static rainbow sheen
   - `mix-blend-mode: overlay` or `screen`

3. **Highlight spot**: Small white ellipse near top-left
   - Creates glassy reflection
   - Slightly offset from center

4. **Edge definition**: Very subtle border or inner shadow
   - Barely visible, suggests surface tension

### Size Variations
- Base size: 120-160px diameter
- Random variation: ±20px per bubble
- Slight squash/stretch (transform: scale) for organic feel

### Bubble Labels
- Centered text within bubble
- Metallic gradient fill matching header
- Subtle text shadow for legibility
- Curved text path optional (advanced)

---

## Animation Specifications

### Bubble Float
```
Duration: 15 seconds (bottom to header collision)
Easing: ease-in-out (or custom cubic-bezier for dreamy feel)

Vertical: translateY from 100vh + bubble-height to header bottom
Horizontal: Sine wave oscillation (zigzag)
  - Amplitude: 30-50px
  - Frequency: 2-3 complete oscillations over journey

Scale: Subtle pulse (0.98 → 1.02) on loop, ~3s cycle
Rotation: Gentle wobble ±5deg, offset per bubble
```

### Spawn Timing
- First bubble: Immediate on page load
- Subsequent bubbles: 3-second intervals
- Sequence: Resume → Projects → Photography → Social → Surprise Me → (loop)

### Bubble Pop (on click)
```
Duration: 300-400ms
Sequence:
  1. Scale up quickly (1 → 1.3) over 100ms
  2. Opacity fade (1 → 0) over 200ms
  3. Optional: Particle burst (small droplets scatter)
  4. Navigate to destination after animation completes
```

### Header Collision
- Bubble fades out (opacity 0) over 500ms when Y position reaches header bottom
- No pop effect—just gentle disappearance

---

## Interaction States

### Bubble Hover
- Slight scale increase (1 → 1.05)
- Intensify iridescent shimmer
- Cursor: pointer
- Optional: Subtle glow/shadow increase

### Bubble Active (mousedown)
- Scale decrease (1 → 0.95)
- Prepares user for "pop" on release

---

## Layout

```
┌─────────────────────────────────────────┐
│            [Sky Background]              │
│                                          │
│        ╭─────────────────────╮          │
│        │   Helen Johnston    │  ← Header │
│        │  Resume, Projects...│           │
│        ╰─────────────────────╯          │
│  - - - - - collision line - - - - - -   │
│                                          │
│         ○ bubble                         │
│              ○ bubble                    │
│                   ○ bubble               │
│                                          │
│    [Bubbles spawn from below viewport]   │
└─────────────────────────────────────────┘
```

- Header: Fixed at top, centered, z-index above bubbles
- Canvas/bubble container: Full viewport, behind header
- Bubbles spawn at random X positions (with padding from edges)

---

## Technical Approach

### Canvas vs DOM
**Recommendation: HTML Canvas**
- Better performance for multiple animated elements
- Easier physics-like motion control
- Cleaner collision detection with header

**Alternative: DOM + CSS**
- Simpler bubble styling (gradients, filters)
- Native click events
- May need requestAnimationFrame for smooth zigzag

### Implementation Files
```
src/
├── main.ts          # Initialize canvas, spawn loop
├── bubble.ts        # Bubble class (position, velocity, render, hit-test)
├── animations.ts    # Easing functions, pop effect
└── style.css        # Header styles, background, fonts
```

---

## Navigation Destinations

| Bubble | Route |
|--------|-------|
| Resume | `/resume` or external PDF |
| Projects | `/projects` |
| Photography | `/photography` |
| Social | `/social` or links page |
| Surprise Me | Random selection from above |

---

## Accessibility Notes

- Bubbles should be keyboard-navigable (Tab to focus, Enter to activate)
- Provide `aria-label` for each bubble's purpose
- Reduced motion preference: Disable zigzag, slow float speed
- Screen reader: Announce navigation options in header text
