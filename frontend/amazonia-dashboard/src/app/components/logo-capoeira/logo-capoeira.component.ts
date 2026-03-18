import { Component, input, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';

/** Caminho do logo: public/logo.jpg é servido na raiz como /logo.jpg */
const LOGO_SRC = '/logo.jpg';

@Component({
  selector: 'app-logo-capoeira',
  standalone: true,
  template: `
    <img
      [attr.width]="size()"
      [attr.height]="size()"
      [src]="logoSrc()"
      alt="Logo CAPOEIRA"
      class="logo-img"
      [class.logo-img-light]="variant() === 'light'"
      loading="lazy"
    />
  `,
  styles: [
    `
      :host {
        display: inline-block;
        color: var(--logo-color, var(--primary));
      }
      .logo-img {
        display: block;
        max-width: 100%;
        height: auto;
        object-fit: contain;
        border-radius: 6px;
      }
      .logo-img-light {
        filter: brightness(0) invert(1);
      }
    `,
  ],
})
export class LogoCapoeiraComponent implements OnInit, OnChanges {
  readonly size = input<number>(40);
  readonly variant = input<'default' | 'light'>('default');
  /** Caminho do logo. Padrão: assets/logo-capoeira.jpg (local em src/assets). */
  readonly src = input<string | undefined>(undefined);

  protected readonly logoSrc = signal(LOGO_SRC);

  ngOnInit(): void {
    this.logoSrc.set(this.src() ?? LOGO_SRC);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.logoSrc.set(this.src() ?? LOGO_SRC);
    }
  }
}
