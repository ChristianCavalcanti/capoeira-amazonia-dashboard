import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly languageService = inject(LanguageService);
  private readonly translation = inject(TranslationService);

  protected readonly footerText = computed(() => {
    this.languageService.current();
    const t = this.translation.get.bind(this.translation);
    return {
      contact: t('footer_contact'),
      funding: t('footer_funding'),
      institutional: t('footer_institutional'),
      linkedin: t('footer_linkedin'),
      copyright: t('footer_copyright'),
      cnpq: t('footer_cnpq'),
      mcti: t('footer_mcti'),
      fndct: t('footer_fndct'),
    };
  });
}
