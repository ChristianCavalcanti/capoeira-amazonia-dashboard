import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LanguageService, type SupportedLanguage } from './language.service';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);

  private translations: Record<SupportedLanguage, Record<string, string>> = {
    pt: {},
    en: {},
  };

  private loaded = false;

  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    return Promise.all([
      firstValueFrom(this.http.get<Record<string, string>>('assets/i18n/pt.json')).catch(() => ({})),
      firstValueFrom(this.http.get<Record<string, string>>('assets/i18n/en.json')).catch(() => ({})),
    ]).then(([pt, en]) => {
      if (pt && typeof pt === 'object') this.translations.pt = pt as Record<string, string>;
      if (en && typeof en === 'object') this.translations.en = en as Record<string, string>;
      this.loaded = true;
    }).catch(() => {
      this.loaded = true;
    });
  }

  get(key: string): string {
    const lang = this.languageService.current();
    return this.translations[lang]?.[key] ?? key;
  }
}
