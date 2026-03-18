import { Component, inject, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AccessibilityToolbarComponent } from './components/accessibility-toolbar/accessibility-toolbar.component';
import { AccessibilityService } from './services/accessibility.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AccessibilityToolbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly a11y = inject(AccessibilityService);

  @HostBinding('style.fontSize.%') get fontScale() {
    return this.a11y.fontScalePercent();
  }

  @HostBinding('class.a11y-high-contrast') get highContrast() {
    return this.a11y.isHighContrast();
  }

  @HostBinding('class.a11y-grayscale') get grayscale() {
    return this.a11y.isGrayscale();
  }

  @HostBinding('class.a11y-dyslexia-font') get dyslexiaFont() {
    return this.a11y.isDyslexiaFont();
  }

  @HostBinding('class.a11y-line-spacing') get lineSpacing() {
    return this.a11y.isLineSpacing();
  }

  @HostBinding('class.a11y-letter-spacing') get letterSpacing() {
    return this.a11y.isLetterSpacing();
  }

  @HostBinding('class.a11y-reduced-motion') get reducedMotion() {
    return this.a11y.isReducedMotion();
  }

  @HostBinding('class.theme-dark') get darkMode() {
    return this.a11y.isDarkMode();
  }
}
