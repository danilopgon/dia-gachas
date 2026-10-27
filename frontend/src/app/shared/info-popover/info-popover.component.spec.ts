import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoPopoverComponent } from './info-popover.component';

@Component({
  standalone: true,
  imports: [InfoPopoverComponent],
  template: `<app-info-popover label="Información" class="fixed right-8 bottom-8"
      ><p>Créditos</p></app-info-popover
    >
    <button id="fuera">Fuera</button>`,
})
class HostComponent {}

describe('InfoPopoverComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  const trigger = () =>
    fixture.nativeElement.querySelector('app-info-popover button') as HTMLButtonElement;
  const panel = () =>
    fixture.nativeElement.querySelector(
      `#${trigger().getAttribute('aria-controls')}`,
    ) as HTMLElement;
  const host = () => fixture.nativeElement.querySelector('app-info-popover') as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('el botón tiene nombre accesible y empieza cerrado', () => {
    expect(trigger().getAttribute('aria-label')).toBe('Información');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(panel().hidden).toBe(true);
  });

  it('abre y cierra con el botón', () => {
    trigger().click();
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(panel().hidden).toBe(false);
    expect(panel().textContent).toContain('Créditos');
    trigger().click();
    fixture.detectChanges();
    expect(panel().hidden).toBe(true);
  });

  it('Escape cierra y devuelve el foco al botón', () => {
    trigger().click();
    fixture.detectChanges();
    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel().hidden).toBe(true);
    expect(document.activeElement).toBe(trigger());
  });

  it('un clic fuera lo cierra', () => {
    trigger().click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('#fuera') as HTMLElement).click();
    fixture.detectChanges();
    expect(panel().hidden).toBe(true);
  });

  it('no impone posición al host: respeta el fixed de quien lo usa', () => {
    expect(host().classList).toContain('fixed');
    expect(host().classList).not.toContain('relative');
    expect(host().classList).not.toContain('absolute');
  });

  it('Escape cierra también con el foco en el botón', () => {
    trigger().focus();
    trigger().click();
    fixture.detectChanges();
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel().hidden).toBe(true);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('sigue el patrón de disclosure, sin role="dialog"', () => {
    expect(panel().getAttribute('role')).toBeNull();
  });
});
