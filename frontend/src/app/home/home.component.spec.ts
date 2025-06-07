import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CitiesResource } from './resources/cities.resource';
import { ICity } from '../core/models/city.interface';

jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));

const mockRouter = { navigate: jest.fn() };
const mockCitiesResource = {
  createSearchResource: jest.fn().mockReturnValue({
    value: jest.fn().mockReturnValue([{ id: 1, name: 'Ciudad Test' }]),
  }),
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
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

  it('debería navegar al resultado cuando hay ciudad seleccionada', () => {
    component.value.set({ id: 1, name: 'Ciudad Test' } as unknown as ICity);
    component.goToResult();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/result', 1]);
  });

  it('no debería navegar si no hay ciudad seleccionada', () => {
    component.value.set(null);
    component.goToResult();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
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
