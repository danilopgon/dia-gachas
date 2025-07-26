import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultComponent } from './result.component';
import { WeatherResource } from './resources/weather.resource';
import { MessageService } from 'primeng/api';
import { GachasLevel } from '../core/enums/gachas-level.enum';
import { ActivatedRoute } from '@angular/router';

let mockWeatherValue: any[] = [];

jest.mock('./resources/weather.resource', () => ({
  WeatherResource: jest.fn().mockImplementation(() => ({
    createWeatherResource: () => ({
      value: () => mockWeatherValue,
    }),
  })),
}));

const mockMessageService = {
  add: jest.fn(),
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jest.fn().mockReturnValue('0078'),
    },
  },
};

describe('ResultComponent', () => {
  let fixture: ComponentFixture<ResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [
        { provide: WeatherResource, useValue: new WeatherResource() },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    fixture = TestBed.createComponent(ResultComponent);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería devolver una cadena vacía si no hay datos', () => {
    mockWeatherValue = [];

    const comp = TestBed.createComponent(ResultComponent).componentInstance;
    comp['weatherRef'] = {
      value: () => [],
    } as any;

    expect((comp as any).getRandomGachasLevelPhrase()).toBe('');
  });

  it('debería devolver una frase con nivel de gachas si hay datos', () => {
    mockWeatherValue = [
      {
        gachasLevel: GachasLevel.HIGH,
      },
    ];

    const comp = TestBed.createComponent(ResultComponent).componentInstance;
    const phrase = (comp as any).getRandomGachasLevelPhrase();

    expect(typeof phrase).toBe('string');
    expect(phrase.length).toBeGreaterThan(0);
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
    comp['getRandomGachasLevelPhrase'] = () => 'nivel épico de gachas';
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
    comp['getRandomGachasLevelPhrase'] = () => 'nivel épico de gachas';

    await comp.shareResults();

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('nivel épico de gachas'),
    );
  });
});
