import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  Inject,
  inject,
  model,
  ModelSignal,
  PLATFORM_ID,
  ResourceStatus,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import gsap from 'gsap';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ICity } from '../../core/models/city.interface';
import { CitiesResource } from './resources/cities.resource';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [ButtonModule, AutoCompleteModule, FloatLabelModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit {
  private readonly citiesResource = inject(CitiesResource);
  private readonly router = inject(Router);

  value: ModelSignal<ICity | null> = model<ICity | null>(null);
  searchTerm: WritableSignal<string> = signal('');
  citiesRef = this.citiesResource.createSearchResource(this.searchTerm);

  // Solo las sugerencias de la consulta actual: mientras carga una nueva, la lista queda vacía.
  cities = computed(() => this.citiesRef.value() ?? []);
  loadFailed = computed(() => this.citiesRef.status() === ResourceStatus.Error);
  noResults = computed(
    () =>
      this.citiesRef.status() === ResourceStatus.Resolved && this.citiesRef.value()?.length === 0,
  );

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

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

  search(event: AutoCompleteCompleteEvent): void {
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
