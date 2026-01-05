// Timing
export const SPAWN_INTERVAL = 3000; // ms between bubble spawns
export const FLOAT_DURATION = 15000; // ms for bubble to reach header
export const POP_DURATION = 300; // ms for pop animation
export const FADE_DURATION = 500; // ms for header collision fade
export const PULSE_PERIOD = 3000; // ms for scale pulse cycle

// Sizes
export const BUBBLE_MIN_RADIUS = 60;
export const BUBBLE_MAX_RADIUS = 80;
export const EDGE_PADDING = 100; // px from viewport edges for spawn

// Physics
export const OSCILLATION_AMPLITUDE = 40; // px horizontal swing
export const OSCILLATION_CYCLES = 2.5; // complete sine waves during float
export const WOBBLE_AMPLITUDE = 5; // degrees rotation
export const WOBBLE_FREQUENCY = 2; // cycles per float
export const PULSE_AMPLITUDE = 0.02; // scale variation (±2%)
export const HOVER_SCALE = 1.08;

// Colors
export const COLORS = {
  sky: {
    top: '#87CEEB',
    mid: '#B0E0F6',
    bottom: '#E0F4FF',
  },
  bubble: {
    baseLight: 'rgba(255, 255, 255, 0.4)',
    baseMid: 'rgba(127, 219, 255, 0.3)',
    baseDark: 'rgba(221, 160, 221, 0.2)',
    highlight: 'rgba(255, 255, 255, 0.8)',
    edge: 'rgba(255, 255, 255, 0.3)',
  },
  metallic: {
    start: '#FF69B4',
    mid: '#00CED1',
    end: '#9370DB',
  },
};

// Navigation
export const BUBBLE_SEQUENCE = [
  'Resume',
  'Projects',
  'Photography',
  'Social',
  'Surprise Me',
] as const;

export type BubbleLabel = (typeof BUBBLE_SEQUENCE)[number];

// Base path must match vite.config.ts
const BASE = '/helen-website-bubbles';

export const ROUTES: Record<BubbleLabel, string> = {
  Resume: `${BASE}/resume/index.html`,
  Projects: `${BASE}/projects/index.html`,
  Photography: `${BASE}/photography/index.html`,
  Social: `${BASE}/social/index.html`,
  'Surprise Me': '', // Handled specially
};

// Get route for a bubble, handling "Surprise Me"
export function getRouteForLabel(label: BubbleLabel): string {
  if (label === 'Surprise Me') {
    const options = BUBBLE_SEQUENCE.filter((l) => l !== 'Surprise Me');
    const random = options[Math.floor(Math.random() * options.length)];
    return ROUTES[random];
  }
  return ROUTES[label];
}
