import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MUNICIPIOS_URL, MunicipiosCatalogService } from './municipios-catalog.service';

const villas = Array.from({ length: 25 }, (_, i) => ({
  id: `28${String(100 + i).padStart(3, '0')}`,
  name: `Villa ${String.fromCharCode(65 + i)}`,
  provinceId: '28',
}));

const catalog = {
  version: 1,
  source: { repo: 'danilopgon/localidades-provincias-aemet', revision: 'abc' },
  provinces: [
    { id: '01', name: 'Araba Álava' },
    { id: '02', name: 'Albacete' },
    { id: '03', name: 'Alicante/Alacant' },
    { id: '05', name: 'Ávila' },
    { id: '16', name: 'Cuenca' },
    { id: '28', name: 'Madrid' },
    { id: '31', name: 'Navarra' },
  ],
  cities: [
    { id: '01001', name: 'Alegría-Dulantzi', provinceId: '01' },
    { id: '02003', name: 'Albacete', provinceId: '02' },
    { id: '02050', name: 'Calbarro', provinceId: '02' },
    { id: '02060', name: 'Villa de Albero', provinceId: '02' },
    { id: '02069', name: 'Roda, La', provinceId: '02' },
    { id: '03011', name: "Alfàs del Pi, l'", provinceId: '03' },
    { id: '03105', name: 'Pinoso, el/Pinoso', provinceId: '03' },
    { id: '05019', name: 'Ávila', provinceId: '05' },
    { id: '16058', name: 'Castejón', provinceId: '16' },
    { id: '31070', name: 'Castejón', provinceId: '31' },
    ...villas,
  ],
};

describe('MunicipiosCatalogService', () => {
  let service: MunicipiosCatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MunicipiosCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const searchWithCatalog = async (query: string) => {
    const result = service.search(query);
    http.expectOne(MUNICIPIOS_URL).flush(catalog);
    return result;
  };

  it('ignora tildes y mayúsculas', async () => {
    const result = await searchWithCatalog('AVILA');
    expect(result.map(c => c.name)).toEqual(['Ávila']);
    expect(result[0].province).toEqual({ id: '05', name: 'Ávila' });
  });

  it('distingue homónimos por provincia', async () => {
    const result = await searchWithCatalog('castejon');
    expect(result.map(c => `${c.name} (${c.province.name})`)).toEqual([
      'Castejón (Cuenca)',
      'Castejón (Navarra)',
    ]);
  });

  it('ordena primero los que empiezan por la consulta, luego inicio de palabra y luego el resto', async () => {
    const result = await searchWithCatalog('alb');
    expect(result.map(c => c.name)).toEqual(['Albacete', 'Villa de Albero', 'Calbarro']);
  });

  it('encuentra los nombres con el artículo al final escritos en orden natural', async () => {
    expect((await searchWithCatalog('la roda')).map(c => c.name)).toEqual(['Roda, La']);
  });

  it('sigue encontrando esos nombres por su forma del catálogo', async () => {
    expect((await searchWithCatalog('roda')).map(c => c.name)).toEqual(['Roda, La']);
  });

  it('une el artículo apostrofado sin espacio y lo busca en cada nombre oficial', async () => {
    expect((await searchWithCatalog("l'alfas")).map(c => c.name)).toEqual(["Alfàs del Pi, l'"]);
    expect((await service.search('el pinoso')).map(c => c.name)).toEqual(['Pinoso, el/Pinoso']);
  });

  it('devuelve como máximo 20 sugerencias', async () => {
    const result = await searchWithCatalog('villa');
    expect(result).toHaveLength(20);
  });

  it('conserva los códigos con cero inicial como cadenas', async () => {
    const [city] = await searchWithCatalog('alegria');
    expect(city.id).toBe('01001');
  });

  it('descarga el catálogo una sola vez', async () => {
    await searchWithCatalog('alb');
    await service.search('avila');
    http.expectNone(MUNICIPIOS_URL);
  });

  it('si la descarga falla, la siguiente búsqueda la reintenta', async () => {
    const failed = service.search('alb');
    http.expectOne(MUNICIPIOS_URL).flush('error', { status: 500, statusText: 'Server Error' });
    await expect(failed).rejects.toBeTruthy();

    const result = await searchWithCatalog('alb');
    expect(result[0].name).toBe('Albacete');
  });
});
