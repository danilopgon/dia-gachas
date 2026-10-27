import { Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/** Botón redondo que muestra u oculta un panel (patrón disclosure de la APG). */
@Component({
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
        class="credits-trigger"
      >
        <app-icon name="info" />
      </button>
      <div
        [id]="panelId"
        [hidden]="!open()"
        class="credits-panel"
      >
        <ng-content />
      </div>
    </div>
  `,
  // Escape cierra desde el botón o desde el panel; un clic fuera también cierra.
  host: {
    class: 'block',
    '(keydown.escape)': 'closeAndFocus()',
    '(document:click)': 'onDocumentClick($event)',
  },
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

  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
