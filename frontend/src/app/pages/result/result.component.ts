import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WeatherLoadError, WeatherResource } from './resources/weather.resource';
import { getRandomGachasMessage } from '../../core/utils/get-random-gachas-message.util';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { getWeatherIcon, iconMap } from '../../core/utils/weather-icon.util';

const ERROR_MESSAGES = {
  'not-found': 'No encontramos ese municipio.',
  unavailable: 'Ahora mismo no hay previsión para este municipio. Vuelve a intentarlo en un rato.',
  network: 'No se ha podido conectar. Revisa tu conexión.',
} as const;

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [RouterModule, CommonModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './result.component.html',
})
export class ResultComponent {
  private route = inject(ActivatedRoute);
  private weatherResource = inject(WeatherResource);
  private router = inject(Router);

  private id = signal('');
  private randomMessage = signal('');

  weatherRef = this.weatherResource.createWeatherResource(this.id);
  weather = computed(() => this.weatherRef.value()?.days);
  staleHours = computed(() => {
    const meta = this.weatherRef.value()?.meta;
    return meta?.stale ? Math.round(meta.ageHours) : null;
  });
  errorMessage = computed(() => {
    const error = this.weatherRef.error();
    const kind = error instanceof WeatherLoadError ? error.kind : 'unavailable';
    return ERROR_MESSAGES[kind];
  });
  icon = computed(() => {
    const data = this.weather();
    const description = data?.[0]?.skyStatus ?? '';
    return iconMap[getWeatherIcon(description)];
  });

  get gachasLevel(): string {
    return this.randomMessage();
  }

  constructor(private readonly messageService: MessageService) {
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

    this.messageService.add({
      severity: 'success',
      summary: 'Copiado',
      detail: 'Link copiado al portapapeles',
    });
  }
}
