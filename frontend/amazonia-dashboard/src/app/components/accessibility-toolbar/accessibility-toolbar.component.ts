import { Component, signal, HostListener, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityPanelComponent } from '../accessibility-panel/accessibility-panel.component';
import { LanguageService } from '../../services/language.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-accessibility-toolbar',
  standalone: true,
  imports: [CommonModule, AccessibilityPanelComponent],
  templateUrl: './accessibility-toolbar.component.html',
  styleUrl: './accessibility-toolbar.component.css',
})
export class AccessibilityToolbarComponent {
  private readonly language = inject(LanguageService);
  private readonly translation = inject(TranslationService);
  protected panelOpen = signal(false);

  protected readonly a11yButtonLabel = computed(() => {
    this.language.current();
    const t = this.translation.get.bind(this.translation);
    return this.panelOpen() ? t('a11y_button_close') : t('a11y_button_open');
  });

  protected readonly a11yButtonText = computed(() => {
    this.language.current();
    return this.translation.get('a11y_title');
  });

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closePanel();
    }
  }

  protected togglePanel(): void {
    this.panelOpen.update((v) => !v);
  }

  protected closePanel(): void {
    this.panelOpen.set(false);
  }
}
