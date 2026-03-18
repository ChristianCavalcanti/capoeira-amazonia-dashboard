import { Component, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService } from '../../services/accessibility.service';
import { LanguageService } from '../../services/language.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-accessibility-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-panel.component.html',
  styleUrl: './accessibility-panel.component.css',
})
export class AccessibilityPanelComponent {
  protected readonly a11y = inject(AccessibilityService);
  private readonly language = inject(LanguageService);
  private readonly translation = inject(TranslationService);
  readonly close = output<void>();

  protected readonly labels = computed(() => {
    this.language.current();
    const t = this.translation.get.bind(this.translation);
    return {
      title: t('a11y_title'),
      close: t('a11y_close'),
      textSize: t('a11y_text_size'),
      decreaseFont: t('a11y_decrease_font'),
      increaseFont: t('a11y_increase_font'),
      visualModes: t('a11y_visual_modes'),
      highContrast: t('a11y_high_contrast'),
      grayscale: t('a11y_grayscale'),
      dyslexiaFont: t('a11y_dyslexia_font'),
      readability: t('a11y_readability'),
      lineSpacing: t('a11y_line_spacing'),
      letterSpacing: t('a11y_letter_spacing'),
      motion: t('a11y_motion'),
      reduceMotion: t('a11y_reduce_motion'),
      darkMode: t('a11y_dark_mode'),
    };
  });

  protected onClose(): void {
    this.close.emit();
  }
}
