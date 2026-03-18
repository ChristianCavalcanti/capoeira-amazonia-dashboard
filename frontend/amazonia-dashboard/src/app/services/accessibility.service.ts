import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEYS = {
  fontScale: 'accessibility-font-scale',
  contrast: 'accessibility-contrast',
  grayscale: 'accessibility-grayscale',
  dyslexiaFont: 'accessibility-dyslexia-font',
  lineSpacing: 'accessibility-line-spacing',
  letterSpacing: 'accessibility-letter-spacing',
  motion: 'accessibility-motion',
  darkMode: 'accessibility-dark-mode',
} as const;

const DEFAULT_FONT_SCALE = 100;
const MIN_FONT_SCALE = 90;
const MAX_FONT_SCALE = 130;
const FONT_STEP = 5;

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly fontScale = signal<number>(this.loadNumber(STORAGE_KEYS.fontScale, DEFAULT_FONT_SCALE));
  private readonly highContrast = signal<boolean>(this.loadBool(STORAGE_KEYS.contrast));
  private readonly grayscale = signal<boolean>(this.loadBool(STORAGE_KEYS.grayscale));
  private readonly dyslexiaFont = signal<boolean>(this.loadBool(STORAGE_KEYS.dyslexiaFont));
  private readonly lineSpacing = signal<boolean>(this.loadBool(STORAGE_KEYS.lineSpacing));
  private readonly letterSpacing = signal<boolean>(this.loadBool(STORAGE_KEYS.letterSpacing));
  private readonly reducedMotion = signal<boolean>(this.loadBool(STORAGE_KEYS.motion));
  private readonly darkMode = signal<boolean>(this.loadBool(STORAGE_KEYS.darkMode));

  readonly fontScalePercent = computed(() => this.fontScale());
  readonly isHighContrast = computed(() => this.highContrast());
  readonly isGrayscale = computed(() => this.grayscale());
  readonly isDyslexiaFont = computed(() => this.dyslexiaFont());
  readonly isLineSpacing = computed(() => this.lineSpacing());
  readonly isLetterSpacing = computed(() => this.letterSpacing());
  readonly isReducedMotion = computed(() => this.reducedMotion());
  readonly isDarkMode = computed(() => this.darkMode());

  readonly canIncreaseFont = computed(() => this.fontScale() < MAX_FONT_SCALE);
  readonly canDecreaseFont = computed(() => this.fontScale() > MIN_FONT_SCALE);

  private loadNumber(key: string, defaultVal: number): number {
    if (typeof localStorage === 'undefined') return defaultVal;
    const v = localStorage.getItem(key);
    if (v == null) return defaultVal;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? defaultVal : Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, n));
  }

  private loadBool(key: string): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(key) === 'true';
  }

  private save(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }

  increaseFontSize(): void {
    const next = Math.min(MAX_FONT_SCALE, this.fontScale() + FONT_STEP);
    this.fontScale.set(next);
    this.save(STORAGE_KEYS.fontScale, String(next));
  }

  decreaseFontSize(): void {
    const next = Math.max(MIN_FONT_SCALE, this.fontScale() - FONT_STEP);
    this.fontScale.set(next);
    this.save(STORAGE_KEYS.fontScale, String(next));
  }

  setHighContrast(value: boolean): void {
    this.highContrast.set(value);
    this.save(STORAGE_KEYS.contrast, String(value));
  }

  setGrayscale(value: boolean): void {
    this.grayscale.set(value);
    this.save(STORAGE_KEYS.grayscale, String(value));
  }

  setDyslexiaFont(value: boolean): void {
    this.dyslexiaFont.set(value);
    this.save(STORAGE_KEYS.dyslexiaFont, String(value));
  }

  setLineSpacing(value: boolean): void {
    this.lineSpacing.set(value);
    this.save(STORAGE_KEYS.lineSpacing, String(value));
  }

  setLetterSpacing(value: boolean): void {
    this.letterSpacing.set(value);
    this.save(STORAGE_KEYS.letterSpacing, String(value));
  }

  setReducedMotion(value: boolean): void {
    this.reducedMotion.set(value);
    this.save(STORAGE_KEYS.motion, String(value));
  }

  setDarkMode(value: boolean): void {
    this.darkMode.set(value);
    this.save(STORAGE_KEYS.darkMode, String(value));
  }
}
