import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WeatherResource } from './resources/weather.resource';

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [RouterModule, CommonModule],
  templateUrl: './result.component.html',
})
export class ResultComponent {
  private route = inject(ActivatedRoute);
  private weatherResource = inject(WeatherResource);

  private id = signal('');
  weatherRef = this.weatherResource.createWeatherResource(this.id);

  weather = computed(() => this.weatherRef.value());

  constructor() {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) this.id.set(idFromRoute);
  }
}
