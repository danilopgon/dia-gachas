import { GACHAS_MESSAGES } from '../constants/gachas-messages.constant';
import { GachasLevel } from '../enums/gachas-level.enum';

export function getRandomGachasMessage(level: GachasLevel): string {
  const messages = GACHAS_MESSAGES[level];
  if (!messages?.length) return 'No hay mensaje disponible.';
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}
