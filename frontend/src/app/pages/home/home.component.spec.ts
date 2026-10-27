import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { CitiesResource } from './resources/cities.resource';
import { ICity } from '../../core/models/city.interface';

jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));

const ERROR_MESSAGE = 'No se han podido cargar los municipios. Inténtalo de nuevo.';
const EMPTY_MESSAGE = 'No hay ningún municipio con ese nombre.';

const alegria: ICity = {
  id: '01001',
  name: 'Alegría-Dulantzi',
  province: { id: '01', name: 'Araba Álava' },
};

const mockRouter = { navigate: jest.fn() };
const storedValue = signal<ICity[] | undefined>(undefined);
const status = signal('idle');
// Como en Angular 20: leer value() con el recurso en error lanza una excepción.
const value = Object.assign(
  () => {
    if (status() === 'error') throw new Error('Resource is currently in an error state');
    return storedValue();
  },
  { set: (v: ICity[] | undefined) => storedValue.set(v) },
);
const searchResource = {
  value,
  hasValue: () => status() !== 'error' && storedValue() !== undefined,
  status,
  error: signal<unknown>(undefined),
};
const mockCitiesResource = {
  createSearchResource: jest.fn().mockReturnValue(searchResource),
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(() => {
    searchResource.value.set(undefined);
    searchResource.status.set('idle');
    searchResource.error.set(undefined);
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CitiesResource, useValue: mockCitiesResource },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería actualizar el searchTerm al llamar a search()', () => {
    component.search({ query: 'Albacete' } as any);
    expect(component.searchTerm()).toBe('Albacete');
  });

  it('muestra las sugerencias del recurso y las vacía mientras no hay resultado', () => {
    searchResource.value.set([alegria]);
    searchResource.status.set('resolved');
    expect(component.cities()).toEqual([alegria]);

    searchResource.value.set(undefined);
    searchResource.status.set('loading');
    expect(component.cities()).toEqual([]);
  });

  it('muestra un mensaje si no se pueden cargar los municipios', () => {
    searchResource.status.set('error');
    searchResource.error.set(new Error('500'));
    fixture.detectChanges();
    expect(text()).toContain(ERROR_MESSAGE);
  });

  it('muestra un mensaje si no hay resultados', () => {
    searchResource.value.set([]);
    searchResource.status.set('resolved');
    fixture.detectChanges();
    expect(text()).toContain(EMPTY_MESSAGE);
    expect(text()).not.toContain(ERROR_MESSAGE);
  });

  it('no muestra mensajes sin búsqueda', () => {
    expect(text()).not.toContain(EMPTY_MESSAGE);
    expect(text()).not.toContain(ERROR_MESSAGE);
  });

  it('navega al resultado conservando el cero inicial del código', () => {
    component.value.set(alegria);
    component.goToResult();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/result', '01001']);
  });

  it('no debería navegar si no hay ciudad seleccionada', () => {
    component.value.set(null);
    component.goToResult();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('muestra el municipio con su provincia', () => {
    expect(component.displayName(alegria)).toBe('Alegría-Dulantzi (Araba Álava)');
  });

  it('debería llamar a configureGsapAnimations en ngAfterViewInit si es browser y desktop', () => {
    const spy = jest.spyOn(component as any, 'configureGsapAnimations');

    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    component.ngAfterViewInit();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('no debería animar si el ancho es móvil', () => {
    Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
    const spy = jest.spyOn(component as any, 'configureGsapAnimations');
    component.ngAfterViewInit();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
