import en from './en';
import nl from './nl';

export type V2Messages = typeof en;
export const messages = { en, nl } as const;
export type V2Locale = keyof typeof messages;

export function getV2Messages(locale: string): V2Messages {
  if (locale === 'nl') return nl;
  return en;
}
