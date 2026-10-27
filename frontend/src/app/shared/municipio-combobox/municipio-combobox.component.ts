import { Component, computed, effect, input, output, signal } from '@angular/core';
import { ICity } from '../../core/models/city.interface';

export type ComboboxStatus = 'idle' | 'loading' | 'error' | 'empty' | 'ready';

let nextId = 0;

/**
 * Buscador de municipios con el patrón ARIA 1.2 «combobox con listbox»:
 * solo pinta y emite; la búsqueda la hace quien lo usa.
 */
@Component({
  standalone: true,
  selector: 'app-municipio-combobox',
  templateUrl: './municipio-combobox.component.html',
})
export class MunicipioComboboxComponent {
  label = input.required<string>();
  suggestions = input<ICity[]>([]);
  status = input<ComboboxStatus>('idle');

  query = output<string>();
  selected = output<ICity | null>();

  readonly id = `municipio-${nextId++}`;
  readonly listboxId = `${this.id}-listbox`;

  text = signal('');
  private open = signal(false);
  activeIndex = signal(-1);
  private chosen: ICity | null = null;

  expanded = computed(() => this.open() && this.suggestions().length > 0);
  activeId = computed(() =>
    this.expanded() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null,
  );

  constructor() {
    // Una lista nueva empieza sin opción activa.
    effect(() => {
      this.suggestions();
      this.activeIndex.set(-1);
    });
  }

  optionId(index: number): string {
    return `${this.id}-option-${index}`;
  }

  displayName(city: ICity): string {
    return `${city.name} (${city.province.name})`;
  }

  onInput(value: string): void {
    this.text.set(value);
    this.open.set(true);
    if (this.chosen) {
      this.chosen = null;
      this.selected.emit(null);
    }
    this.query.emit(value);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!count) return;
        this.open.set(true);
        this.activeIndex.update(i => (i + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!count) return;
        this.open.set(true);
        this.activeIndex.update(i => (i <= 0 ? count - 1 : i - 1));
        break;
      case 'Home':
        if (!this.expanded()) return;
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        if (!this.expanded()) return;
        event.preventDefault();
        this.activeIndex.set(count - 1);
        break;
      case 'Enter':
        if (this.expanded() && this.activeIndex() >= 0) {
          event.preventDefault();
          this.choose(this.suggestions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.open.set(false);
        this.activeIndex.set(-1);
        break;
    }
  }

  // mousedown en vez de click: se elige antes de que el blur cierre la lista.
  onOptionMousedown(event: MouseEvent, city: ICity): void {
    event.preventDefault();
    this.choose(city);
  }

  close(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  private choose(city: ICity): void {
    this.chosen = city;
    this.text.set(this.displayName(city));
    this.close();
    this.selected.emit(city);
  }
}
