import {
  Component,
  computed,
  effect,
  inject,
  model,
  ModelSignal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ICity } from '../core/models/city.interface';
import { CitiesResource } from './resources/cities.resource';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [ButtonModule, AutoCompleteModule, FloatLabelModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly citiesResource = inject(CitiesResource);
  private readonly router = inject(Router);

  value: ModelSignal<ICity | null> = model<ICity | null>(null);
  searchTerm: WritableSignal<string> = signal('');
  citiesRef = this.citiesResource.createSearchResource(this.searchTerm);

  cities = computed(() => this.lastCities());
  private lastCities: WritableSignal<ICity[]> = signal([]);

  constructor() {
    effect(() => {
      const value = this.citiesRef.value();
      if (value && value.length) {
        this.lastCities.set(value);
      }
    });
  }

  search(event: AutoCompleteCompleteEvent) {
    this.searchTerm.set(event.query);
  }

  goToResult() {
    const city = this.value();
    if (city) {
      this.router.navigate(['/result', city.id]);
    }
  }
}
