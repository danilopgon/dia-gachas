import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WeatherResource } from './resources/weather.resource';
import { getRandomGachasMessage } from '../core/utils/get-random-gachas-message.util';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
  private id = signal('');
  private randomMessage = signal('');

  weatherRef = this.weatherResource.createWeatherResource(this.id);
  weather = computed(() => this.weatherRef.value());

  get gachasLevel(): string {
    return this.randomMessage();
  }

  constructor(private readonly messageService: MessageService) {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) this.id.set(idFromRoute);

    effect(() => {
      const data = this.weather();
      if (Array.isArray(data) && data.length && data[0].gachasLevel) {
        this.randomMessage.set(getRandomGachasMessage(data[0].gachasLevel));
      }
    });
  }

  private getRandomGachasLevelPhrase(): string {
    const data = this.weather();
    if (!Array.isArray(data) || !data.length || !data[0].gachasLevel) return '';

    return getRandomGachasMessage(data[0].gachasLevel);
  }

  async shareResults() {
    const data = this.weather();
    const town = data?.[0]?.town ?? 'mi pueblo';
    const level = this.getRandomGachasLevelPhrase();
    const message = `Hoy en ${town}, nivel de gachas: ${level}`;

    if (navigator.share) {
      await navigator.share({
        title: 'Día de Gachas',
        text: message,
        url: window.location.href,
      });
    } else {
      await this.copyFallback(message);
    }
  }

  async copyFallback(message: string) {
    await navigator.clipboard.writeText(`${message} ${window.location.href}`);
    this.messageService.add({
      severity: 'success',
      summary: 'Copiado',
      detail: 'Link copiado al portapapeles',
    });
  }
}
