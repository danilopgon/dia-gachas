import { TestBed } from '@angular/core/testing';
import { CitiesResource } from './cities.resource';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of } from 'rxjs';

jest.useFakeTimers();

describe('CitiesResource (TestBed + runInInjectionContext)', () => {
  let resource: CitiesResource;
  let httpMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpMock = { get: jest.fn() } as any;
    TestBed.configureTestingModule({
      providers: [CitiesResource, { provide: HttpClient, useValue: httpMock }],
    });
    resource = TestBed.inject(CitiesResource);
  });

  it('no llama a la API ni cambia el valor si la query tiene menos de 3 caracteres', async () => {
    const query = signal('ab');
    let searchResource: ReturnType<typeof resource.createSearchResource>;
    TestBed.runInInjectionContext(() => {
      searchResource = resource.createSearchResource(query);
    });
    jest.advanceTimersByTime(500);
    // Espera las microtareas (resource necesita el ciclo para actualizar)
    await Promise.resolve();
    await Promise.resolve();
    expect(searchResource!.value()).toEqual([]);
    expect(httpMock.get).not.toHaveBeenCalled();
  });

  it('llama a la API y actualiza el valor tras el debounce', async () => {
    const query = signal('mad');
    const cities = [{ id: 1, name: 'Madrid' }];
    httpMock.get.mockReturnValueOnce(of({ status: 'ok', data: cities }));
    let searchResource: ReturnType<typeof resource.createSearchResource>;
    TestBed.runInInjectionContext(() => {
      searchResource = resource.createSearchResource(query);
    });

    expect(searchResource!.value()).toBeUndefined();

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(searchResource!.value()).toEqual(cities);
    expect(httpMock.get).toHaveBeenCalledWith(
      expect.stringContaining('/cities'),
      expect.objectContaining({ params: { name: 'mad' } }),
    );
  });

  it('si la query cambia rápido, solo hace la llamada tras el último debounce', async () => {
    const query = signal('');
    const cities = [{ id: 2, name: 'Madrid' }];
    httpMock.get.mockReturnValueOnce(of({ status: 'ok', data: cities }));
    let searchResource: ReturnType<typeof resource.createSearchResource>;
    TestBed.runInInjectionContext(() => {
      searchResource = resource.createSearchResource(query);
    });

    query.set('m');
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    expect(searchResource!.value()).toStrictEqual([]);

    query.set('ma');
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    expect(searchResource!.value()).toStrictEqual([]);

    query.set('mad');
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    expect(searchResource!.value()).toStrictEqual([]);

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(searchResource!.value()).toEqual(cities);
  });

  it('devuelve [] si la query solo tiene espacios', async () => {
    const query = signal('   ');
    let searchResource: ReturnType<typeof resource.createSearchResource>;
    TestBed.runInInjectionContext(() => {
      searchResource = resource.createSearchResource(query);
    });
    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();
    expect(searchResource!.value()).toEqual([]);
    expect(httpMock.get).not.toHaveBeenCalled();
  });
});
