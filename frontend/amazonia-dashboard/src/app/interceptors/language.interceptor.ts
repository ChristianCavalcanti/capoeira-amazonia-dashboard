import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = inject(LanguageService).current();
  const acceptLanguage = lang === 'pt' ? 'pt-BR' : 'en';
  const cloned = req.clone({
    setHeaders: { 'Accept-Language': acceptLanguage },
  });
  return next(cloned);
};
