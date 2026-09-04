import { Language, Translations } from './types';
import { en } from './en';
import { mn } from './mn';

export * from './types';

export const translations: Record<Language, Translations> = {
  en,
  mn,
};
