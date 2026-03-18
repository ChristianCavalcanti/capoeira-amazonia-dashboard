import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-highlight-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './highlight-card.component.html',
  styleUrl: './highlight-card.component.css',
})
export class HighlightCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly subtitle = input<string>('');
  readonly icon = input<'area' | 'carbon' | 'regions' | 'trend' | 'sites' | 'institutions'>('area');
  readonly tooltip = input<string>('');
  readonly variation = input<string>('');
}
