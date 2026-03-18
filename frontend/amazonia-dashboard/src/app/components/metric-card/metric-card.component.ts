import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
})
export class MetricCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly subtitle = input<string>('');
}
