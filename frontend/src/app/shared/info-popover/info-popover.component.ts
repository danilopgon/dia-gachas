import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/** Botón redondo que muestra u oculta un panel (patrón disclosure de la APG). */
@Component({
  standalone: true,
  selector: 'app-info-popover',
  imports: [IconComponent],
  template: `
    <!-- El posicionamiento del host lo decide quien lo usa; aquí solo el ancla del panel. -->
    <div class="relative">
      <button
        #trigger
        type="button"
        [attr.aria-label]="label()"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="panelId"
        (click)="toggle()"
        class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-2xl hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
      >
        <app-icon name="info" />
      </button>
      <div
        [id]="panelId"
        [hidden]="!open()"
        class="absolute right-0 bottom-full mb-3 w-[min(42rem,calc(100vw-4rem))] rounded-md bg-white p-4 text-slate-700 shadow-xl"
      >
        <ng-content />
      </div>
    </div>
  `,
  // Escape cierra desde el botón o desde el panel.
  host: { class: 'block', '(keydown.escape)': 'closeAndFocus()' },
})
export class InfoPopoverComponent {
  label = input.required<string>();

  readonly panelId = `info-popover-${nextId++}`;
  open = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  toggle(): void {
    this.open.update(open => !open);
  }

  closeAndFocus(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
