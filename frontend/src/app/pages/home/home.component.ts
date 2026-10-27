import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  model,
  ModelSignal,
  PLATFORM_ID,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import gsap from 'gsap';
import { ICity } from '../../core/models/city.interface';
import { IconComponent } from '../../shared/icon/icon.component';
import {
  ComboboxStatus,
  MunicipioComboboxComponent,
} from '../../shared/municipio-combobox/municipio-combobox.component';
import { CitiesResource } from './resources/cities.resource';

@Component({
  selector: 'app-home',
  imports: [MunicipioComboboxComponent, IconComponent, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit {
  private readonly citiesResource = inject(CitiesResource);
  private readonly router = inject(Router);

  value: ModelSignal<ICity | null> = model<ICity | null>(null);
  searchTerm: WritableSignal<string> = signal('');
  citiesRef = this.citiesResource.createSearchResource(this.searchTerm);

  // Solo las sugerencias de la consulta actual: mientras carga una nueva, la lista queda vacía.
  // En Angular 20 value() lanza si el recurso está en error: se lee solo con valor.
  cities = computed(() => (this.citiesRef.hasValue() ? this.citiesRef.value() : []));
  loadFailed = computed(() => this.citiesRef.status() === 'error');
  noResults = computed(() => this.citiesRef.status() === 'resolved' && this.cities().length === 0);

  comboboxStatus = computed<ComboboxStatus>(() => {
    if (this.loadFailed()) return 'error';
    if (this.noResults()) return 'empty';
    if (this.citiesRef.status() === 'loading') return 'loading';
    return this.citiesRef.status() === 'resolved' ? 'ready' : 'idle';
  });

  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.innerWidth < 1024) return;
    this.configureGsapAnimations();
  }

  private configureGsapAnimations(): void {
    gsap.fromTo(
      '#fondo-sol',
      { scale: 1.2, y: -60 },
      { scale: 1, y: 0, duration: 1.3, ease: 'power2.out' },
    );

    gsap.to('#fondo-sol', {
      y: '+=30',
      repeat: -1,
      yoyo: true,
      duration: 2.5,
      ease: 'sine.inOut',
      delay: 1.3,
    });

    gsap.fromTo(
      '#fondo-colinas',
      { scale: 1.2, y: 40 },
      { scale: 1, y: 150, duration: 1.4, ease: 'power2.out' },
    );

    gsap.fromTo(
      '#fondo-colinas-frente',
      { scale: 1.2, y: -40 },
      { scale: 1, y: 130, duration: 1.5, ease: 'power2.out' },
    );
  }

  search(event: { query: string }): void {
    this.searchTerm.set(event.query);
  }

  goToResult(): void {
    const city = this.value();
    if (city) {
      this.router.navigate(['/result', city.id]);
    }
  }

  displayName(city: ICity): string {
    return `${city.name} (${city.province.name})`;
  }
}
