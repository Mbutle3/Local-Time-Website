import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  inject,
  Output,
} from '@angular/core';
import Globe, { type GlobeInstance } from 'globe.gl';

@Component({
  selector: 'app-globe',
  standalone: true,
  template: ``,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: visible;
        text-align: center;
        vertical-align: middle;
      }
      :host ::ng-deep canvas {
        text-align: center;
        vertical-align: middle;
      }
      :host ::ng-deep div {
        text-align: center;
        vertical-align: middle;
      }
    `,
  ],
})
export class GlobeComponent implements AfterViewInit, OnChanges, OnDestroy {
  private elementRef = inject(ElementRef<HTMLElement>);

  @Input() lat: number | null = null;
  @Input() lng: number | null = null;
  /** Notable cities to show as markers (same timezone). */
  @Input() cities: { lat: number; lng: number; name: string }[] = [];

  /** Currently selected city (yellow pin); others are white. */
  @Input() selectedCity: { lat: number; lng: number; name: string } | null = null;

  /** Emits the clicked city so the app can show time in that region. */
  @Output() cityClick = new EventEmitter<{ lat: number; lng: number; name: string }>();

  private globe: GlobeInstance | null = null;

  ngAfterViewInit(): void {
    const el = this.elementRef.nativeElement;
    if (!el) return;

    // Wait for host to have dimensions (it's inside an *ngIf that just mounted)
    setTimeout(() => this.initGlobe(el as HTMLDivElement), 0);
  }

  private getAssetUrl(path: string): string {
    const base = document.querySelector('base')?.getAttribute('href') || '/';
    const baseUrl = new URL(base, window.location.origin);
    return new URL(path.replace(/^\//, ''), baseUrl.origin + baseUrl.pathname).href;
  }

  private initGlobe(el: HTMLDivElement): void {
    if (this.globe) return;

    // Use full absolute URLs so Three.js TextureLoader can load textures in any context
    const earthImg = this.getAssetUrl('/assets/globe/earth-blue-marble.jpg');
    const bumpImg = this.getAssetUrl('/assets/globe/earth-topology.png');

    this.globe = new Globe(el)
      .backgroundColor('rgba(0, 0, 0, 0)')
      .showAtmosphere(true)
      .atmosphereColor('#ffffff')
      .atmosphereAltitude(0.15)
      .globeImageUrl(earthImg)
      .bumpImageUrl(bumpImg)
      .showGraticules(true)
      .pointOfView({ lat: 0, lng: 0, altitude: 2.2 })
      .pointsData([])
      .pointLat('lat')
      .pointLng('lng')
      .pointLabel('name')
      .pointColor((d: object) => this.getPointColor(d as { lat: number; lng: number; name: string }))
      .pointRadius(0.4)
      .pointAltitude(0)
      .onPointClick((point: object) => {
        const p = point as { lat: number; lng: number; name: string };
        if (p && typeof p.lat === 'number' && typeof p.lng === 'number' && typeof p.name === 'string') {
          this.cityClick.emit(p);
        }
      });

    this.updatePoint();

    // Country border lines (stroke-only polygons from Natural Earth GeoJSON)
    const countriesUrl = this.getAssetUrl('/assets/globe/ne_110m_admin_0_countries.geojson');
    fetch(countriesUrl)
      .then((res) => res.json())
      .then((geojson: { features?: Array<{ geometry: unknown; properties?: Record<string, unknown> }> }) => {
        if (!this.globe) return;
        const features = geojson.features?.filter((f) => f.properties?.['ISO_A2'] !== 'AQ') ?? [];
        this.globe
          .polygonsData(features)
          .polygonCapColor(() => 'rgba(0,0,0,0)')
          .polygonSideColor(() => 'rgba(0,0,0,0)')
          .polygonStrokeColor(() => 'rgba(255,255,255,0.35)')
          .polygonAltitude(0)
          .polygonsTransitionDuration(0);
      })
      .catch(() => {});

    // Move canvas to clock-container (before app-globe) so it renders in the desired DOM order
    setTimeout(() => this.moveCanvasToClockContainer(el), 0);
  }

  private moveCanvasToClockContainer(host: HTMLElement): void {
    const canvas = host.querySelector('canvas');
    const clockContainer = host.closest('.clock-container');
    if (canvas && clockContainer) {
      clockContainer.insertBefore(canvas, host);
      // Remove all remaining content from host (wrapper divs), keep only the canvas in DOM
      while (host.firstChild) {
        host.removeChild(host.firstChild);
      }
      // Collapse host so only the canvas is visible in layout
      host.style.display = 'none';
    }
  }

  ngOnChanges(): void {
    this.updatePoint();
  }

  private getPointColor(d: { lat: number; lng: number; name: string }): string {
    const s = this.selectedCity;
    if (s && s.lat === d.lat && s.lng === d.lng && s.name === d.name) return '#eab308'; // yellow (selected)
    return '#ffffff'; // white (selectable)
  }

  private updatePoint(): void {
    if (!this.globe) return;

    const hasLocation =
      this.lat != null && this.lng != null && !Number.isNaN(this.lat) && !Number.isNaN(this.lng);
    const focusLat = hasLocation ? Number(this.lat) : 0;
    const focusLng = hasLocation ? Number(this.lng) : 0;

    if (this.cities.length > 0) {
      this.globe
        .pointsData(this.cities)
        .pointColor((d: object) => this.getPointColor(d as { lat: number; lng: number; name: string }));
      this.globe.pointOfView({ lat: focusLat, lng: focusLng, altitude: 2.2 }, 800);
    } else if (hasLocation) {
      this.globe.pointsData([{ lat: focusLat, lng: focusLng, name: '' }]);
      this.globe.pointOfView({ lat: focusLat, lng: focusLng, altitude: 2.2 }, 800);
    } else {
      this.globe.pointsData([]);
      this.globe.pointOfView({ lat: 0, lng: 0, altitude: 2.2 }, 800);
    }
  }

  ngOnDestroy(): void {
    if (this.globe && '_destructor' in this.globe && typeof this.globe._destructor === 'function') {
      this.globe._destructor();
    }
    this.globe = null;
  }
}
