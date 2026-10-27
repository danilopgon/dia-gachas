import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ICity } from '../../../core/models/city.interface';
import { CitiesResource } from './cities.resource';
import { MunicipiosCatalogService } from './municipios-catalog.service';

jest.useFakeTimers();

const city = (id: string, name: string): ICity => ({
  id,
  name,
  province: { id: id.slice(0, 2), name: 'Provincia' },
});

// Ejecuta los efectos pendientes (el debounce vive en un effect) y las microtareas del recurso.
const flush = async () => {
  // debounced() → params → loader: cada salto necesita un tick y sus microtareas.
  for (let round = 0; round < 3; round++) {
    TestBed.tick();
    for (let i = 0; i < 5; i++) await Promise.resolve();
  }
};

describe('CitiesResource', () => {
  let resource: CitiesResource;
  let catalog: { search: jest.Mock };

  beforeEach(() => {
    catalog = { search: jest.fn() };
    TestBed.configureTestingModule({
      providers: [CitiesResource, { provide: MunicipiosCatalogService, useValue: catalog }],
    });
    resource = TestBed.inject(CitiesResource);
  });

  const create = (query: ReturnType<typeof signal<string>>) => {
    const searchResource = TestBed.runInInjectionContext(() =>
      resource.createSearchResource(query),
    );
    TestBed.tick();
    return searchResource;
  };

  it('no busca si la consulta tiene menos de 3 caracteres', async () => {
    const searchResource = create(signal('ab'));
    jest.advanceTimersByTime(500);
    await flush();
    expect(searchResource.status()).toBe('idle');
    expect(catalog.search).not.toHaveBeenCalled();
  });

  it('no busca si la consulta solo tiene espacios', async () => {
    const searchResource = create(signal('     '));
    jest.advanceTimersByTime(500);
    await flush();
    expect(searchResource.status()).toBe('idle');
    expect(catalog.search).not.toHaveBeenCalled();
  });

  it('busca en el catálogo tras 300 ms de debounce', async () => {
    const result = [city('02003', 'Albacete')];
    catalog.search.mockResolvedValue(result);
    // debounced() aplica el valor inicial al momento: el debounce es para lo que se escribe después.
    const query = signal('');
    const searchResource = create(query);
    query.set('alb');
    await flush();

    jest.advanceTimersByTime(299);
    await flush();
    expect(catalog.search).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await flush();
    expect(catalog.search).toHaveBeenCalledWith('alb');
    expect(searchResource.value()).toEqual(result);
  });

  it('si la consulta cambia rápido, solo busca la última', async () => {
    catalog.search.mockResolvedValue([city('28079', 'Madrid')]);
    const query = signal('');
    const searchResource = create(query);

    for (const value of ['m', 'ma', 'mad']) {
      query.set(value);
      await flush();
      jest.advanceTimersByTime(100);
    }
    jest.advanceTimersByTime(300);
    await flush();

    expect(catalog.search).toHaveBeenCalledTimes(1);
    expect(catalog.search).toHaveBeenCalledWith('mad');
    expect(searchResource.value()).toEqual([city('28079', 'Madrid')]);
  });

  it('descarta la respuesta tardía de una consulta anterior', async () => {
    let resolveAlb!: (cities: ICity[]) => void;
    catalog.search.mockImplementation((q: string) =>
      q === 'alb'
        ? new Promise<ICity[]>(resolve => (resolveAlb = resolve))
        : Promise.resolve([city('16078', 'Cuenca')]),
    );
    const query = signal('alb');
    const searchResource = create(query);
    jest.advanceTimersByTime(300);
    await flush();

    query.set('cuen');
    await flush();
    jest.advanceTimersByTime(300);
    await flush();
    resolveAlb([city('02003', 'Albacete')]);
    await flush();

    expect(searchResource.value()).toEqual([city('16078', 'Cuenca')]);
  });

  it('al borrar una consulta ya resuelta, queda inactivo al momento sin esperar el debounce', async () => {
    catalog.search.mockResolvedValue([city('02003', 'Albacete')]);
    const query = signal('');
    const searchResource = create(query);
    query.set('alb');
    await flush();
    jest.advanceTimersByTime(300);
    await flush();
    expect(searchResource.status()).toBe('resolved');

    query.set('');
    await flush();
    expect(searchResource.status()).toBe('idle');
  });

  it('si la consulta pendiente se acorta por debajo de 3 caracteres, no busca', async () => {
    const query = signal('');
    create(query);
    query.set('alb');
    await flush();
    jest.advanceTimersByTime(100);

    query.set('al');
    await flush();
    jest.advanceTimersByTime(300);
    await flush();
    expect(catalog.search).not.toHaveBeenCalled();
  });

  it('expone el error si el catálogo no se puede cargar', async () => {
    catalog.search.mockRejectedValue(new Error('500'));
    const searchResource = create(signal('alb'));
    jest.advanceTimersByTime(300);
    await flush();
    expect(searchResource.status()).toBe('error');
  });
});
