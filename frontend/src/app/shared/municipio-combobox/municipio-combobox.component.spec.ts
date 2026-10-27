import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ICity } from '../../core/models/city.interface';
import { ComboboxStatus, MunicipioComboboxComponent } from './municipio-combobox.component';

const castejonCuenca: ICity = {
  id: '16066',
  name: 'Castejón',
  province: { id: '16', name: 'Cuenca' },
};
const castejonNavarra: ICity = {
  id: '31070',
  name: 'Castejón',
  province: { id: '31', name: 'Navarra' },
};
const albacete: ICity = { id: '02003', name: 'Albacete', province: { id: '02', name: 'Albacete' } };

describe('MunicipioComboboxComponent', () => {
  let fixture: ComponentFixture<MunicipioComboboxComponent>;
  let component: MunicipioComboboxComponent;
  let queries: string[];
  let selections: (ICity | null)[];

  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const options = () =>
    Array.from(fixture.nativeElement.querySelectorAll('[role="option"]')) as HTMLElement[];
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const key = (k: string) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    fixture.detectChanges();
  };
  const type = (value: string) => {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const set = (suggestions: ICity[], status: ComboboxStatus = 'ready') => {
    fixture.componentRef.setInput('suggestions', suggestions);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MunicipioComboboxComponent] });
    fixture = TestBed.createComponent(MunicipioComboboxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Busca tu pueblo');
    queries = [];
    selections = [];
    component.query.subscribe(q => queries.push(q));
    component.selected.subscribe(c => selections.push(c));
    fixture.detectChanges();
  });

  it('tiene una etiqueta visible asociada al campo', () => {
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.textContent?.trim()).toBe('Busca tu pueblo');
    expect(label.htmlFor).toBe(input().id);
    expect(input().getAttribute('role')).toBe('combobox');
  });

  it('emite cada cambio del texto', () => {
    type('alb');
    expect(queries).toEqual(['alb']);
  });

  it('abre la lista con sugerencias y la cierra sin ellas', () => {
    type('alb');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    set([albacete]);
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(options()).toHaveLength(1);
  });

  it('muestra cada opción con su provincia para distinguir homónimos', () => {
    type('castejon');
    set([castejonCuenca, castejonNavarra]);
    expect(options().map(o => o.textContent?.trim())).toEqual([
      'Castejón (Cuenca)',
      'Castejón (Navarra)',
    ]);
  });

  it('se maneja con el teclado: flechas, Enter y aria-activedescendant', () => {
    type('castejon');
    set([castejonCuenca, castejonNavarra]);
    key('ArrowDown');
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0].id);
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    key('ArrowDown');
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[1].id);
    key('ArrowUp');
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0].id);
    key('End');
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[1].id);
    key('Home');
    key('Enter');
    expect(selections).toEqual([castejonCuenca]);
    expect(input().value).toBe('Castejón (Cuenca)');
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape cierra la lista sin seleccionar', () => {
    type('alb');
    set([albacete]);
    key('ArrowDown');
    key('Escape');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(selections).toEqual([]);
  });

  it('selecciona con el ratón', () => {
    type('alb');
    set([albacete]);
    options()[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();
    expect(selections).toEqual([albacete]);
  });

  it('escribir después de elegir anula la selección', () => {
    type('alb');
    set([albacete]);
    key('ArrowDown');
    key('Enter');
    type('albx');
    expect(selections).toEqual([albacete, null]);
  });

  it.each([
    ['empty', 'No hay ningún municipio con ese nombre.'],
    ['error', 'No se han podido cargar los municipios. Inténtalo de nuevo.'],
  ] as const)('anuncia el estado %s en role="status"', (status, message) => {
    type('xyz');
    set([], status);
    const live = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(live.textContent).toContain(message);
  });

  it('anuncia cuántas sugerencias hay', () => {
    type('castejon');
    set([castejonCuenca, castejonNavarra]);
    expect(text()).toContain('2 municipios encontrados');
  });
});
