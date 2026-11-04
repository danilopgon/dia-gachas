import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WeatherLoadError, WeatherResource } from './resources/weather.resource';
import { getRandomGachasMessage } from '../../core/utils/get-random-gachas-message.util';
import { IconComponent } from '../../shared/icon/icon.component';
import { reducedMotion } from '../../core/utils/reduced-motion.util';
import { describeWeather } from '../../core/utils/weather-scene.util';
import { WeatherSceneComponent } from '../../shared/weather-scene/weather-scene.component';

const ERROR_MESSAGES = {
  'not-found': 'No encontramos ese municipio.',
  unavailable: 'Ahora mismo no hay previsión para este municipio. Vuelve a intentarlo en un rato.',
  network: 'No se ha podido conectar. Revisa tu conexión.',
} as const;

const LONG_SKY_CHARACTERS = 20;
const SKY_PAUSED_KEY = 'gachas-cielo-parado';

// El almacenamiento puede estar bloqueado: entonces la elección dura lo que dure la visita.
function readSkyPaused(): boolean {
  try {
    return localStorage.getItem(SKY_PAUSED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSkyPaused(paused: boolean): void {
  try {
    localStorage.setItem(SKY_PAUSED_KEY, paused ? '1' : '0');
  } catch {
    // Sin persistencia no se pierde nada importante.
  }
}

@Component({
  selector: 'app-result',
  imports: [RouterModule, IconComponent, WeatherSceneComponent],
  templateUrl: './result.component.html',
})
export class ResultComponent {
  private route = inject(ActivatedRoute);
  private weatherResource = inject(WeatherResource);
  private router = inject(Router);

  private id = signal('');
  private randomMessage = signal('');

  weatherRef = this.weatherResource.createWeatherResource(this.id);
  // En Angular 20 value() lanza si el recurso está en error: se lee solo con valor.
  private result = computed(() =>
    this.weatherRef.hasValue() ? this.weatherRef.value() : undefined,
  );
  weather = computed(() => this.result()?.days);
  staleHours = computed(() => {
    const meta = this.result()?.meta;
    return meta?.stale ? Math.round(meta.ageHours) : null;
  });
  errorMessage = computed(() => {
    const error = this.weatherRef.error();
    const kind = error instanceof WeatherLoadError ? error.kind : 'unavailable';
    return ERROR_MESSAGES[kind];
  });
  /** Vacía hasta que llegan los datos: así el tiempo entra en el cielo al «mirar». */
  scene = computed(() => {
    const today = this.weather()?.[0];
    return today
      ? describeWeather(today.skyStatus, today.launchTimeRainProbability, today.launchTemperature)
      : null;
  });

  /** Más larga que esto ya no cabe bien en su columna: ocupa una fila entera. */
  longSky = computed(() => (this.weather()?.[0]?.skyStatus.length ?? 0) > LONG_SKY_CHARACTERS);

  /** Con movimiento reducido el cielo ya está quieto y el control sobra. */
  reduced = reducedMotion();
  skyPaused = signal(readSkyPaused());

  toggleSky(): void {
    const paused = !this.skyPaused();
    this.skyPaused.set(paused);
    writeSkyPaused(paused);
  }

  get gachasLevel(): string {
    return this.randomMessage();
  }

  /** Aviso tras copiar el texto para compartir; se oculta solo. */
  copied = signal(false);
  private copiedTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    this.initializeId(idFromRoute);

    effect(() => {
      const data = this.weather();
      if (Array.isArray(data) && data.length && data[0].gachasLevel) {
        this.randomMessage.set(getRandomGachasMessage(data[0].gachasLevel));
      }
    });
  }

  private initializeId(idFromRoute: string | null): void {
    if (!idFromRoute || idFromRoute.length !== 5) {
      this.router.navigate(['/']);
    } else {
      this.id.set(idFromRoute);
    }
  }

  async shareResults() {
    if (typeof navigator === 'undefined') return;

    const data = this.weather();
    const town = data?.[0]?.town ?? 'mi pueblo';
    const level = this.gachasLevel;
    const message = `Hoy en ${town}, nivel de gachas: ${level}`;

    if (navigator.share) {
      await navigator.share({
        title: 'Día de Gachas',
        text: message,
        url: typeof window !== 'undefined' ? window.location.href : '',
      });
    } else {
      await this.copyFallback(message);
    }
  }

  async copyFallback(message: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;

    await navigator.clipboard.writeText(
      `${message} ${typeof window !== 'undefined' ? window.location.href : ''}`,
    );

    this.copied.set(true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(false), 3000);
  }
}
