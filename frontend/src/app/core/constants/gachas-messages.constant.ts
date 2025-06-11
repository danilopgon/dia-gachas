import { GachasLevel } from '../enums/gachas-level.enum';

export const GACHAS_MESSAGES: Record<GachasLevel, string[]> = {
  [GachasLevel.NONE]: [
    'Hoy ni con el perol tuneao. Hace para gazpacho.',
    'Esto no son gachas, esto es para ir en mangas de camisa.',
    'Ni el frío ni la nostalgia: hoy no toca.',
    'No es día de gachas… es día de terraceo y birra sin abrigo.',
  ],
  [GachasLevel.LOW]: [
    'Si las haces es por vicio, no por clima.',
    'Tira a fresquico, aunque todavía no cruje el alma.',
    'Gachómetro en ámbar, como los días sin bufanda.',
    'Si las haces, que sea con música triste de fondo.',
  ],
  [GachasLevel.MEDIUM]: [
    'Hoy sí que cuela, calienta el aceite y pon los ajos.',
    'Gachable, sin llegar al nivel ‘pueblo con niebla’.',
    'Está el día que te lo pide el cuerpo. Y la abuela.',
    'Con frío, nublado y ganas de rebañar: día decente.',
  ],
  [GachasLevel.HIGH]: [
    'Gachismo extremo: saca el perol y el cucharón industrial.',
    '¡Día de gachas confirmado! Saca el perol.',
    'Frío de los que se cuelan por el espinazo. Toca cuchareo.',
    'Este es de los de sentadilla cósmica y gachas dobles.',
  ],
};
