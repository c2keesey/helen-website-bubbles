import './style.css';
import { Bubble } from './bubble';
import { SPAWN_INTERVAL, BUBBLE_SEQUENCE, BubbleLabel } from './config';

// State
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let bubbles: Bubble[] = [];
let lastTime = 0;
let lastSpawnTime = 0;
let sequenceIndex = 0;
let headerBottom = 0;
let dpr = 1;
let reducedMotion = false;

// Check reduced motion preference
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
reducedMotion = motionQuery.matches;
motionQuery.addEventListener('change', (e) => {
  reducedMotion = e.matches;
});

async function init(): Promise<void> {
  // Wait for fonts
  await document.fonts.ready;

  canvas = document.getElementById('bubbles') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  ctx = context;

  setupCanvas();
  setupEventListeners();
  updateHeaderBounds();

  // Start animation loop
  lastTime = performance.now();
  requestAnimationFrame(animate);
}

function setupCanvas(): void {
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.scale(dpr, dpr);
}

function updateHeaderBounds(): void {
  const header = document.getElementById('header');
  if (header) {
    headerBottom = header.getBoundingClientRect().bottom;
  }
}

function setupEventListeners(): void {
  window.addEventListener('resize', () => {
    setupCanvas();
    updateHeaderBounds();
  });

  // Mouse move for hover
  canvas.addEventListener('mousemove', handleMouseMove);

  // Click for bubble pop
  canvas.addEventListener('click', handleClick);

  // Touch support
  canvas.addEventListener('touchstart', handleTouch, { passive: false });

  // Keyboard navigation
  setupKeyboardNav();
}

function handleMouseMove(e: MouseEvent): void {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let hoveredAny = false;

  for (const bubble of bubbles) {
    const wasHovered = bubble.isHovered;
    bubble.isHovered = bubble.containsPoint(x, y);

    if (bubble.isHovered) {
      hoveredAny = true;
    }

    if (bubble.isHovered !== wasHovered) {
      // State changed
    }
  }

  canvas.style.cursor = hoveredAny ? 'pointer' : 'default';
}

function handleClick(e: MouseEvent): void {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (const bubble of bubbles) {
    if (bubble.containsPoint(x, y)) {
      bubble.startPop();
      break;
    }
  }
}

function handleTouch(e: TouchEvent): void {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  for (const bubble of bubbles) {
    if (bubble.containsPoint(x, y)) {
      bubble.startPop();
      break;
    }
  }
}

function setupKeyboardNav(): void {
  const container = document.getElementById('a11y-buttons');
  if (!container) return;

  // Create buttons for each bubble type
  BUBBLE_SEQUENCE.forEach((label) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.setAttribute('aria-label', `Navigate to ${label}`);
    button.addEventListener('click', () => {
      // Find a floating bubble with this label and pop it
      const bubble = bubbles.find((b) => b.label === label && b.phase === 'floating');
      if (bubble) {
        bubble.startPop();
      }
    });
    button.addEventListener('focus', () => {
      // Highlight bubble with this label
      bubbles.forEach((b) => {
        b.isFocused = b.label === label && b.phase === 'floating';
      });
    });
    button.addEventListener('blur', () => {
      bubbles.forEach((b) => {
        b.isFocused = false;
      });
    });
    container.appendChild(button);
  });
}

function spawnBubble(): void {
  const label = BUBBLE_SEQUENCE[sequenceIndex] as BubbleLabel;
  sequenceIndex = (sequenceIndex + 1) % BUBBLE_SEQUENCE.length;

  const rect = canvas.getBoundingClientRect();
  const bubble = new Bubble(label, rect.width, rect.height, headerBottom);

  bubbles.push(bubble);
}

function animate(currentTime: number): void {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Spawn new bubbles
  if (currentTime - lastSpawnTime >= SPAWN_INTERVAL) {
    spawnBubble();
    lastSpawnTime = currentTime;
  }

  // Clear canvas
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Update and render bubbles
  for (const bubble of bubbles) {
    // Apply reduced motion settings
    if (reducedMotion) {
      bubble.rotation = 0;
    }
    bubble.update(deltaTime);
    bubble.render(ctx);
  }

  // Remove completed bubbles
  bubbles = bubbles.filter((b) => !b.isComplete());

  requestAnimationFrame(animate);
}

// Spawn first bubble immediately
function start(): void {
  spawnBubble();
  lastSpawnTime = performance.now();
}

// Initialize
init().then(start);
