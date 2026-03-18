import {
  Component,
  input,
  output,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  signal,
} from '@angular/core';
import type { RestorationRecord } from '../../models/restoration.model';
import {
  REGION_COORDINATES,
  AMAZON_CENTER,
  DEFAULT_ZOOM,
} from './region-coordinates';
import type { Map, Marker } from 'leaflet';

const OSM_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

type RecordWithType = RestorationRecord & { restoration_type?: string };

@Component({
  selector: 'app-amazon-map',
  standalone: true,
  templateUrl: './amazon-map.component.html',
  styleUrl: './amazon-map.component.css',
})
export class AmazonMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly records = input<RestorationRecord[]>([]);
  readonly selectedRegion = input<string | null>(null);
  readonly regionSelected = output<string>();

  private map: Map | null = null;
  private markers: Marker[] = [];
  protected readonly containerId = 'amazon-map-' + Math.random().toString(36).slice(2, 9);
  protected readonly mapReady = signal(false);

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 150);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    if (changes['records'] || changes['selectedRegion']) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    import('leaflet').then((L) => {
      this.map = L.map(this.containerId, {
        center: AMAZON_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      L.tileLayer(OSM_TILE, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(this.map);

      this.updateMarkers();
      this.mapReady.set(true);

      setTimeout(() => this.map?.invalidateSize(), 250);
    });
  }

  private buildPopupContent(record: RecordWithType): string {
    const type = (record as RecordWithType).restoration_type ?? 'Não informado';
    const ecosystem = 'Floresta ombrófila';
    return (
      `<div class="map-popup">` +
      `<strong class="map-popup-title">${record.region}</strong>` +
      `<div class="map-popup-row"><span>Estado / Região</span> ${record.region}</div>` +
      `<div class="map-popup-row"><span>Tipo de ecossistema</span> ${ecosystem}</div>` +
      `<div class="map-popup-row"><span>Método</span> ${type}</div>` +
      `<div class="map-popup-row"><span>Ano</span> ${record.year}</div>` +
      `<div class="map-popup-row"><span>Área restaurada</span> ${record.area_restored} ha</div>` +
      `<div class="map-popup-row"><span>Carbono estimado</span> ${record.carbon} tCO₂e</div>` +
      `</div>`
    );
  }

  private updateMarkers(): void {
    if (!this.map) return;

    import('leaflet').then((L) => {
      this.doUpdateMarkers(L);
    });
  }

  private doUpdateMarkers(L: typeof import('leaflet')): void {
    if (!this.map) return;

    this.clearMarkers();
    const data = this.records();
    const selected = this.selectedRegion();

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const selectedIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [31, 51],
      iconAnchor: [15, 51],
    });

    let selectedCoords: [number, number] | null = null;

    for (const record of data) {
      const coords = REGION_COORDINATES[record.region];
      if (!coords) continue;

      const region = record.region;
      const isSelected = region === selected;
      const icon = isSelected ? selectedIcon : defaultIcon;

      const marker = L.marker(coords, { icon })
        .addTo(this.map!)
        .bindPopup(this.buildPopupContent(record as RecordWithType), {
          className: 'map-popup-wrapper',
        });

      if (selected && !isSelected) {
        marker.setOpacity(0.5);
      }

      marker.on('click', () => {
        this.regionSelected.emit(region);
        this.flyToRegion(region);
      });

      if (isSelected) selectedCoords = coords;
      this.markers.push(marker);
    }

    if (selectedCoords && this.map) {
      this.flyToRegionByCoords(selectedCoords);
    }
  }

  private flyToRegion(region: string): void {
    const coords = REGION_COORDINATES[region];
    if (coords) this.flyToRegionByCoords(coords);
  }

  private flyToRegionByCoords(coords: [number, number]): void {
    if (!this.map) return;
    this.map.flyTo(coords, this.map.getZoom(), { animate: true, duration: 0.5 });
  }

  private clearMarkers(): void {
    for (const m of this.markers) {
      m.remove();
    }
    this.markers = [];
  }
}
