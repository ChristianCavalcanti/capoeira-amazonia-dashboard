import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.css',
})
export class ChartCardComponent {
  readonly title = input<string>('');
}
