import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { reducedMotion } from '../../core/utils/reduced-motion.util';
import { WeatherScene } from '../../core/utils/weather-scene.util';
import { WeatherPainter } from './weather-painter';

/** Evita saltos tras un tirón: el navegador ya suspende la animación en pestañas ocultas. */
const MAX_FRAME_SECONDS = 0.05;

@Component({
  selector: 'app-weather-scene',
  template: `<canvas #canvas class="weather-scene"></canvas>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherSceneComponent {
  scene = input<WeatherScene | null>(null);
  /** Congela el cielo en el fotograma actual, sin perder la escena. */
  paused = input(false);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly painter = signal<WeatherPainter | null>(null);
  private readonly reduced = reducedMotion();
  private readonly still = computed(() => this.paused() || this.reduced());
  private frame = 0;
  private lastTime = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const canvas = this.canvasRef().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return; // Sin canvas queda el paisaje, y los datos siguen en texto.

      const painter = new WeatherPainter(canvas, ctx);
      const onResize = () => {
        painter.resize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio);
        if (this.still()) painter.draw(0);
      };
      onResize();
      window.addEventListener('resize', onResize);
      destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
      this.painter.set(painter);
    });

    effect(() => {
      const painter = this.painter();
      const scene = this.scene();
      if (painter) painter.setScene(scene, untracked(this.still));
    });

    effect(() => {
      const painter = this.painter();
      const hasScene = this.scene() !== null;
      const still = this.still();
      this.stop();
      if (!painter) return;
      if (still) painter.settle();
      painter.draw(0);
      if (hasScene && !still) this.loop(painter);
    });

    destroyRef.onDestroy(() => this.stop());
  }

  private loop(painter: WeatherPainter): void {
    this.lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(MAX_FRAME_SECONDS, (now - this.lastTime) / 1000);
      this.lastTime = now;
      painter.draw(dt);
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private stop(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
}
