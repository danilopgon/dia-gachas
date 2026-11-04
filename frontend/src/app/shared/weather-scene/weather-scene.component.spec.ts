import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describeWeather } from '../../core/utils/weather-scene.util';
import { WeatherPainter } from './weather-painter';
import { WeatherSceneComponent } from './weather-scene.component';

// El pintor necesita un canvas real; aquí solo importa cómo lo gobierna el componente.
jest.mock('./weather-painter');

const SCENE = describeWeather('Despejado', 0, 15);

describe('WeatherSceneComponent', () => {
  let fixture: ComponentFixture<WeatherSceneComponent>;
  let setScene: jest.SpyInstance;
  let draw: jest.SpyInstance;
  let queuedFrames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;
  let settle: jest.SpyInstance;
  let motionQuery: {
    matches: boolean;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };
  let cancel: jest.SpyInstance;

  const mockReducedMotion = (matches: boolean) => {
    motionQuery = { matches, addEventListener: jest.fn(), removeEventListener: jest.fn() };
    window.matchMedia = jest.fn().mockReturnValue(motionQuery) as unknown as typeof window.matchMedia;
  };

  /** Angular también usa requestAnimationFrame: se mira lo que se pinta, no las llamadas. */
  const framesPaintedAfterFlush = () => {
    draw.mockClear();
    const frames = [...queuedFrames.values()];
    queuedFrames.clear();
    frames.forEach((callback) => callback(performance.now() + 16));
    return draw.mock.calls.length;
  };

  const render = async (scene: typeof SCENE | null) => {
    fixture = TestBed.createComponent(WeatherSceneComponent);
    fixture.componentRef.setInput('scene', scene);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as unknown as RenderingContext);
    jest.spyOn(WeatherPainter.prototype, 'resize').mockImplementation(() => undefined);
    setScene = jest.spyOn(WeatherPainter.prototype, 'setScene').mockImplementation(() => undefined);
    draw = jest.spyOn(WeatherPainter.prototype, 'draw').mockImplementation(() => undefined);
    settle = jest.spyOn(WeatherPainter.prototype, 'settle').mockImplementation(() => undefined);
    queuedFrames = new Map();
    nextFrameId = 1;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      queuedFrames.set(nextFrameId, callback);
      return nextFrameId++;
    });
    cancel = jest
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation((id) => void queuedFrames.delete(id));
    mockReducedMotion(false);
  });

  afterEach(() => jest.restoreAllMocks());

  it('anima la escena cuando llegan los datos', async () => {
    await render(SCENE);
    expect(setScene).toHaveBeenCalledWith(SCENE, false);
    expect(framesPaintedAfterFlush()).toBe(1);
  });

  it('deja el cielo vacío y sin bucle mientras no hay datos', async () => {
    await render(null);
    expect(setScene).toHaveBeenCalledWith(null, false);
    expect(framesPaintedAfterFlush()).toBe(0);
  });

  it('con movimiento reducido pinta un fotograma quieto y no arranca el bucle', async () => {
    mockReducedMotion(true);
    await render(SCENE);
    expect(setScene).toHaveBeenCalledWith(SCENE, true);
    expect(draw).toHaveBeenCalledWith(0);
    expect(framesPaintedAfterFlush()).toBe(0);
  });

  it('la pausa congela el fotograma sin cambiar de escena, y se puede reanudar', async () => {
    await render(SCENE);
    setScene.mockClear();

    fixture.componentRef.setInput('paused', true);
    await fixture.whenStable();
    expect(settle).toHaveBeenCalled();
    expect(framesPaintedAfterFlush()).toBe(0);
    expect(setScene).not.toHaveBeenCalled();

    fixture.componentRef.setInput('paused', false);
    await fixture.whenStable();
    expect(framesPaintedAfterFlush()).toBe(1);
    expect(setScene).not.toHaveBeenCalled();
  });

  it('se detiene si el usuario activa el movimiento reducido con la página abierta', async () => {
    await render(SCENE);
    const onChange = motionQuery.addEventListener.mock.calls[0][1];
    onChange({ matches: true });
    await fixture.whenStable();
    expect(framesPaintedAfterFlush()).toBe(0);
  });

  it('deja de escuchar la preferencia al destruirse', async () => {
    await render(SCENE);
    fixture.destroy();
    expect(motionQuery.removeEventListener).toHaveBeenCalled();
  });

  it('para el bucle al destruirse', async () => {
    await render(SCENE);
    fixture.destroy();
    expect(cancel).toHaveBeenCalled();
    expect(framesPaintedAfterFlush()).toBe(0);
  });

  it('no falla si el navegador no da contexto de canvas', async () => {
    (HTMLCanvasElement.prototype.getContext as jest.Mock).mockReturnValue(null);
    await render(SCENE);
    expect(setScene).not.toHaveBeenCalled();
  });
});
