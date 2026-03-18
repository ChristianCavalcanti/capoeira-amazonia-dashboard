import { Component, input } from '@angular/core';

@Component({
  selector: 'app-capoeira-logo',
  standalone: true,
  template: `
    <img
      [attr.width]="size()"
      [attr.height]="size()"
      [src]="src()"
      alt="Logo do Centro CAPOEIRA"
      class="capoeira-logo"
      [class.capoeira-logo-light]="variant() === 'light'"
      loading="lazy"
    />
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .capoeira-logo {
        display: block;
        max-width: 100%;
        height: auto;
        object-fit: contain;
        border-radius: 6px;
      }

      /* Para uso sobre fundos escuros (footer, hero com overlay) */
      .capoeira-logo-light {
        filter: brightness(1.1);
      }
    `,
  ],
})
export class CapoeiraLogoComponent {
  readonly size = input<number>(40);
  readonly variant = input<'light' | 'dark'>('dark');
  readonly src = input<string>('assets/logo-capoeira.png');
}

