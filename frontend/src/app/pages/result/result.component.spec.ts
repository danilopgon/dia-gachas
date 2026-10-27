import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultComponent } from './result.component';
import { WeatherResource } from './resources/weather.resource';
import { GachasLevel } from '../../core/enums/gachas-level.enum';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { WeatherLoadError } from './resources/weather.resource';

let mockWeatherValue: any[] = [];
let mockMeta: { ageHours: number; stale: boolean } | undefined;
let mockError: unknown = undefined;

jest.mock('./resources/weather.resource', () => ({
  WeatherLoadError: jest.requireActual('./resources/weather.resource').WeatherLoadError,
  WeatherResource: jest.fn().mockImplementation(() => ({
    createWeatherResource: () => ({
      value: () =>
        mockWeatherValue?.length ? { days: mockWeatherValue, meta: mockMeta } : undefined,
      isLoading: () => false,
      hasValue: () => !!mockWeatherValue?.length,
      error: () => mockError,
    }),
  })),
}));

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jest.fn().mockReturnValue('16002'),
    },
  },
};

describe('ResultComponent', () => {
  let fixture: ComponentFixture<ResultComponent>;

  beforeEach(() => {
    mockWeatherValue = [];
    mockMeta = undefined;
    mockError = undefined;
    TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [
        provideRouter([]),
        { provide: WeatherResource, useValue: new WeatherResource() },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    fixture = TestBed.createComponent(ResultComponent);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería navegar al home si el id del route es incorrecto o null', async () => {
    const invalidIds = [null, '123', '1234567'];

    for (const id of invalidIds) {
      const mockActivatedRouteInvalid = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue(id),
          },
        },
      };

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ResultComponent],
        providers: [
          provideRouter([]),
          { provide: WeatherResource, useValue: new WeatherResource() },
          { provide: ActivatedRoute, useValue: mockActivatedRouteInvalid },
        ],
      }).compileComponents();

      TestBed.createComponent(ResultComponent);

      const router = TestBed.inject(Router);
      expect(router.navigate).toBeDefined();
    }
  });

  it('debería devolver una cadena vacía si no hay datos', () => {
    const comp = TestBed.createComponent(ResultComponent).componentInstance;

    expect(comp.gachasLevel).toBe('');
  });

  it('debería devolver una frase con nivel de gachas si hay datos', () => {
    mockWeatherValue = [
      {
        gachasLevel: GachasLevel.HIGH,
      },
    ];

    const comp = TestBed.createComponent(ResultComponent).componentInstance;
    comp['randomMessage'].set('¡Gachismo extremo!');

    expect(comp.gachasLevel).toBe('¡Gachismo extremo!');
    expect(comp.gachasLevel.length).toBeGreaterThan(0);
  });

  it('debería usar navigator.share si está disponible', () => {
    const mockShare = jest.fn();
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    mockWeatherValue = [
      {
        town: 'mi pueblo',
        province: 'Cuenca',
        launchTemperature: 12,
        launchTimeRainProbability: 70,
        skyStatus: 'Cubierto',
        gachasLevel: GachasLevel.HIGH,
      },
    ];

    const comp = TestBed.createComponent(ResultComponent).componentInstance;
    comp['randomMessage'].set('nivel épico de gachas');
    comp.shareResults();

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Día de Gachas',
      text: 'Hoy en mi pueblo, nivel de gachas: nivel épico de gachas',
      url: window.location.href,
    });
  });

  it('debería usar fallback si navigator.share no está disponible', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
    });

    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };

    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    mockWeatherValue = [
      {
        town: 'mi pueblo',
        province: 'Cuenca',
        launchTemperature: 12,
        launchTimeRainProbability: 70,
        skyStatus: 'Cubierto',
        gachasLevel: GachasLevel.HIGH,
      },
    ];

    const comp = TestBed.createComponent(ResultComponent).componentInstance;
    comp['randomMessage'].set('nivel épico de gachas');

    await comp.shareResults();

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('nivel épico de gachas'),
    );
  });

  describe('avisos', () => {
    const albacete = {
      town: 'Albacete',
      province: 'Albacete',
      date: '2026-10-26',
      launchTemperature: 21,
      launchTimeRainProbability: 0,
      skyStatus: 'Nubes altas',
      gachasLevel: GachasLevel.LOW,
    };
    const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
    const render = () => {
      fixture = TestBed.createComponent(ResultComponent);
      fixture.detectChanges();
    };

    it('avisa cuando los datos son antiguos', () => {
      mockWeatherValue = [albacete];
      mockMeta = { ageHours: 7.6, stale: true };
      render();
      expect(text()).toContain(
        'Datos de hace 8 horas: AEMET aún no ha publicado una previsión más reciente.',
      );
    });

    it('no avisa con datos recientes', () => {
      mockWeatherValue = [albacete];
      mockMeta = { ageHours: 1.7, stale: false };
      render();
      expect(text()).not.toContain('Datos de hace');
    });

    it.each([
      ['not-found', 'No encontramos ese municipio.'],
      [
        'unavailable',
        'Ahora mismo no hay previsión para este municipio. Vuelve a intentarlo en un rato.',
      ],
      ['network', 'No se ha podido conectar. Revisa tu conexión.'],
    ] as const)('explica el error %s', (kind, message) => {
      mockError = new WeatherLoadError(kind);
      render();
      expect(text()).toContain(message);
    });
  });

  describe('compartir sin navigator.share', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, writable: true });
      mockWeatherValue = [
        {
          town: 'mi pueblo',
          province: 'Cuenca',
          launchTemperature: 12,
          launchTimeRainProbability: 70,
          skyStatus: 'Cubierto',
          gachasLevel: GachasLevel.HIGH,
        },
      ];
    });

    it('avisa de que el texto se ha copiado', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        writable: true,
      });
      const fixture = TestBed.createComponent(ResultComponent);
      fixture.detectChanges();
      await fixture.componentInstance.shareResults();
      fixture.detectChanges();
      const live = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('[role="status"]'),
      ).map(el => el.textContent ?? '');
      expect(live.join(' ')).toContain('Texto copiado al portapapeles');
    });

    it('no falla si no hay portapapeles', async () => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, writable: true });
      const fixture = TestBed.createComponent(ResultComponent);
      fixture.detectChanges();
      await expect(fixture.componentInstance.shareResults()).resolves.toBeUndefined();
    });
  });
});
