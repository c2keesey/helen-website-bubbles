import {
  BubbleLabel,
  BUBBLE_MIN_RADIUS,
  BUBBLE_MAX_RADIUS,
  FLOAT_DURATION,
  POP_DURATION,
  FADE_DURATION,
  PULSE_PERIOD,
  OSCILLATION_AMPLITUDE,
  OSCILLATION_CYCLES,
  WOBBLE_AMPLITUDE,
  WOBBLE_FREQUENCY,
  PULSE_AMPLITUDE,
  HOVER_SCALE,
  COLORS,
  getRouteForLabel,
} from './config';

export type BubblePhase = 'floating' | 'popping' | 'fading' | 'complete';

export class Bubble {
  x: number;
  y: number;
  startX: number;
  radius: number;
  label: BubbleLabel;
  phase: BubblePhase = 'floating';
  age = 0;
  opacity = 1;
  scale = 1;
  rotation = 0;
  isHovered = false;
  isFocused = false;

  private popStartTime = 0;
  private fadeStartTime = 0;
  private wobbleOffset: number;
  private viewportHeight: number;
  private headerBottom: number;

  constructor(
    label: BubbleLabel,
    viewportWidth: number,
    viewportHeight: number,
    headerBottom: number
  ) {
    this.label = label;
    this.viewportHeight = viewportHeight;
    this.headerBottom = headerBottom;

    // Random radius within range
    this.radius =
      BUBBLE_MIN_RADIUS + Math.random() * (BUBBLE_MAX_RADIUS - BUBBLE_MIN_RADIUS);

    // Random X position with padding
    const padding = this.radius + 50;
    this.startX = padding + Math.random() * (viewportWidth - padding * 2);
    this.x = this.startX;

    // Start below viewport
    this.y = viewportHeight + this.radius;

    // Random wobble phase offset
    this.wobbleOffset = Math.random() * Math.PI * 2;
  }

  update(deltaTime: number): void {
    if (this.phase === 'complete') return;

    this.age += deltaTime;

    if (this.phase === 'popping') {
      this.updatePop();
      return;
    }

    if (this.phase === 'fading') {
      this.updateFade();
      return;
    }

    // Floating phase
    const floatDurationSec = FLOAT_DURATION / 1000;
    const totalJourney = this.viewportHeight + this.radius * 2;
    const speed = totalJourney / floatDurationSec;

    // Vertical rise
    this.y -= speed * deltaTime;

    // Horizontal sine wave oscillation
    const frequency = (2 * Math.PI * OSCILLATION_CYCLES) / floatDurationSec;
    this.x = this.startX + Math.sin(this.age * frequency) * OSCILLATION_AMPLITUDE;

    // Scale pulse
    const pulsePhase = ((this.age * 1000) % PULSE_PERIOD) / PULSE_PERIOD;
    const baseScale = 1 + Math.sin(pulsePhase * Math.PI * 2) * PULSE_AMPLITUDE;
    this.scale = this.isHovered || this.isFocused ? baseScale * HOVER_SCALE : baseScale;

    // Rotation wobble
    const wobbleFreq = (2 * Math.PI * WOBBLE_FREQUENCY) / floatDurationSec;
    this.rotation = Math.sin(this.age * wobbleFreq + this.wobbleOffset) * WOBBLE_AMPLITUDE;

    // Check for header collision
    if (this.y - this.radius <= this.headerBottom) {
      this.startFade();
    }
  }

  private updatePop(): void {
    const elapsed = this.age - this.popStartTime;
    const progress = elapsed / (POP_DURATION / 1000);

    if (progress < 0.33) {
      // Scale up quickly
      this.scale = 1 + progress * 3 * 0.3;
    } else if (progress < 1) {
      // Fade out
      this.scale = 1.3;
      this.opacity = 1 - (progress - 0.33) / 0.67;
    } else {
      this.phase = 'complete';
      this.navigate();
    }
  }

  private updateFade(): void {
    const elapsed = this.age - this.fadeStartTime;
    const progress = elapsed / (FADE_DURATION / 1000);

    this.opacity = 1 - progress;

    if (progress >= 1) {
      this.phase = 'complete';
    }
  }

  startPop(): void {
    if (this.phase !== 'floating') return;
    this.phase = 'popping';
    this.popStartTime = this.age;
  }

  private startFade(): void {
    if (this.phase !== 'floating') return;
    this.phase = 'fading';
    this.fadeStartTime = this.age;
  }

  private navigate(): void {
    const route = getRouteForLabel(this.label);
    window.location.href = route;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius * this.scale + 5; // Small tolerance
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.phase === 'complete') return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = this.opacity;

    this.drawBase(ctx);
    this.drawIridescence(ctx);
    this.drawHighlight(ctx);
    this.drawEdge(ctx);
    this.drawLabel(ctx);

    // Focus ring
    if (this.isFocused) {
      this.drawFocusRing(ctx);
    }

    ctx.restore();
  }

  private drawBase(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createRadialGradient(
      -this.radius * 0.3,
      -this.radius * 0.3,
      0,
      0,
      0,
      this.radius
    );
    gradient.addColorStop(0, COLORS.bubble.baseLight);
    gradient.addColorStop(0.5, COLORS.bubble.baseMid);
    gradient.addColorStop(1, COLORS.bubble.baseDark);

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private drawIridescence(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(
      -this.radius,
      -this.radius,
      this.radius,
      this.radius
    );

    const hueShift = (this.age * 30) % 360;
    gradient.addColorStop(0, `hsla(${hueShift}, 70%, 70%, 0.15)`);
    gradient.addColorStop(0.5, `hsla(${(hueShift + 120) % 360}, 70%, 70%, 0.15)`);
    gradient.addColorStop(1, `hsla(${(hueShift + 240) % 360}, 70%, 70%, 0.15)`);

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private drawHighlight(ctx: CanvasRenderingContext2D): void {
    const highlightX = -this.radius * 0.4;
    const highlightY = -this.radius * 0.4;
    const highlightRadius = this.radius * 0.25;

    const gradient = ctx.createRadialGradient(
      highlightX,
      highlightY,
      0,
      highlightX,
      highlightY,
      highlightRadius
    );
    gradient.addColorStop(0, COLORS.bubble.highlight);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(highlightX, highlightY, highlightRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private drawEdge(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(0, 0, this.radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.bubble.edge;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawLabel(ctx: CanvasRenderingContext2D): void {
    const fontSize = Math.max(18, this.radius * 0.35);
    ctx.font = `${fontSize}px 'Boogaloo', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(this.label).width;

    const gradient = ctx.createLinearGradient(-textWidth / 2, 0, textWidth / 2, 0);
    gradient.addColorStop(0, COLORS.metallic.start);
    gradient.addColorStop(0.5, COLORS.metallic.mid);
    gradient.addColorStop(1, COLORS.metallic.end);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillStyle = gradient;
    ctx.fillText(this.label, 0, 0);

    ctx.shadowColor = 'transparent';
  }

  private drawFocusRing(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.metallic.mid;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  isComplete(): boolean {
    return this.phase === 'complete';
  }
}
