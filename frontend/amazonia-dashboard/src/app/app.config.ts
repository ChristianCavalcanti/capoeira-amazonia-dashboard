import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { TranslationService } from './services/translation.service';
import { languageInterceptor } from './interceptors/language.interceptor';

function loadTranslations(): () => Promise<void> {
  const translation = inject(TranslationService);
  return () => translation.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([languageInterceptor])),
    provideCharts(withDefaultRegisterables()),
    { provide: APP_INITIALIZER, useFactory: loadTranslations, multi: true },
  ],
};
