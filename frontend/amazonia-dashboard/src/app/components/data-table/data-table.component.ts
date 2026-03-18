import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { RestorationRecord } from '../../models/restoration.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent {
  readonly data = input<RestorationRecord[]>([]);
  readonly loading = input(false);
}
