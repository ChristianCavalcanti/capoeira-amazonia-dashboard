import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'amazonia_lang';

export type SupportedLanguage = 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly stored = (): SupportedLanguage => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'pt' || v === 'en') return v;
    } catch {}
    return 'pt';
  };

  readonly current = signal<SupportedLanguage>(this.stored());

  setLanguage(lang: SupportedLanguage): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    this.current.set(lang);
  }
}

