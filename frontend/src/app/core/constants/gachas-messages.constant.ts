import { GachasLevel } from '../enums/gachas-level.enum';

export const GACHAS_MESSAGES: Record<GachasLevel, string[]> = {
  [GachasLevel.NONE]: [
    'Mucho sol, poco cuchareo. Hoy mejor gazpacho.',
    'Ni frío ni lluvia. Las gachas se han ido de vacaciones.',
    'Hoy no es día de gachas. Pero oye, tú haz lo que quieras.',
    'No me quedan gachas, solo Maxibon...',
  ],
  [GachasLevel.LOW]: [
    'Si las haces es por vicio, no por clima.',
    'No es un día típico de gachas, pero tampoco lo vamos a juzgar.',
    'Gachas por antojo, no por necesidad. Puro disfrute.',
    'Si las haces, que sea con música triste de fondo.',
  ],
  [GachasLevel.MEDIUM]: [
    'Hoy sí que cuela, calienta el aceite y pon los ajos.',
    'Un poco de nubes, un poco de nostalgia. Hoy unas gachas no sobran.’.',
    'No hace tanto frío, pero unas gachas sientan bien igual.',
    'Con frío, nublado y ganas de rebañar: día decente.',
  ],
  [GachasLevel.HIGH]: [
    '¡Gachismo extremo!',
    '¡Día de gachas confirmado! Saca el perol.',
    'Más frío que en la comunión de Pingu. Toca cuchareo.',
    'Cielo gris, lluvia y rasca. Si esto no son gachas, yo soy una ensalada.',
  ],
};
