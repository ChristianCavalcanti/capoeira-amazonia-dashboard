import { Component, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoCapoeiraComponent } from '../logo-capoeira/logo-capoeira.component';
import { LanguageService } from '../../services/language.service';
import { TranslationService } from '../../services/translation.service';
import { AccessibilityService } from '../../services/accessibility.service';

const LINKEDIN_URL = 'https://www.linkedin.com/company/centro-capoeira/posts/?feedView=all';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LogoCapoeiraComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly languageService = inject(LanguageService);
  private readonly translation = inject(TranslationService);
  private readonly a11y = inject(AccessibilityService);

  protected readonly linkedInUrl = LINKEDIN_URL;

  protected isDarkMode(): boolean {
    return this.a11y.isDarkMode();
  }

  protected darkModeLabel = computed(() => {
    this.languageService.current();
    const t = this.translation.get.bind(this.translation);
    return this.a11y.isDarkMode() ? t('a11y_dark_mode_off') : t('a11y_dark_mode');
  });

  protected toggleDarkMode(): void {
    this.a11y.setDarkMode(!this.a11y.isDarkMode());
  }

  protected readonly menuItems = computed(() => {
    this.languageService.current();
    const t = this.translation.get.bind(this.translation);
    return [
      { id: 'inicio', label: t('nav_platform') },
      { id: 'panorama', label: t('nav_panorama') },
      { id: 'mapa', label: t('nav_map') },
      { id: 'laboratorio', label: t('nav_lab') },
      { id: 'bases-cientificas', label: t('nav_catalog') },
      { id: 'insights', label: t('nav_insights') },
      { id: 'centro-capoeira', label: t('nav_centre') },
      { id: 'contato', label: t('nav_updates') },
    ] as const;
  });

  protected menuOpen = false;

  protected scrollToSection(sectionId: string): void {
    this.menuOpen = false;
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /** Fecha o menu ao rolar a página (mobile UX). */
  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
  }

  protected setLanguage(lang: 'pt' | 'en'): void {
    this.languageService.setLanguage(lang);
    this.menuOpen = false;
  }

  protected currentLanguage(): 'pt' | 'en' {
    return this.languageService.current();
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.menuOpen = false;
    }
  }
}
