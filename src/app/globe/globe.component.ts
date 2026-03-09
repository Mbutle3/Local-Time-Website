import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import Globe, { type GlobeInstance } from 'globe.gl';

@Component({
  selector: 'app-globe',
  standalone: true,
  template: `<div #container class="globe-container"></div>`,
  styles: [
    `
      .globe-container {
        width: 100%;
        height: 100%;
        min-height: 200px;
      }
    `,
  ],
})
export class GlobeComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('container', { static: false }) containerRef!: ElementRef<HTMLDivElement>;

  @Input() lat: number | null = null;
  @Input() lng: number | null = null;

  private globe: GlobeInstance | null = null;

  ngAfterViewInit(): void {
    const el = this.containerRef?.nativeElement;
    if (!el) return;

    // Wait for container to have dimensions (it's inside an *ngIf that just mounted)
    setTimeout(() => this.initGlobe(el), 0);
  }

  private initGlobe(el: HTMLDivElement): void {
    if (this.globe) return;

    // Use local assets so the globe texture always loads (no CDN/CORS issues)
    const earthImg = 'assets/globe/earth-blue-marble.jpg';
    const bumpImg = 'assets/globe/earth-topology.png';

    this.globe = new Globe(el)
      .backgroundColor('transparent')
      .showAtmosphere(true)
      .atmosphereColor('#ffffff')
      .atmosphereAltitude(0.15)
      .globeImageUrl(earthImg)
      .bumpImageUrl(bumpImg)
      .showGraticules(false)
      .pointOfView({ lat: 0, lng: 0, altitude: 2.2 })
      .pointsData([])
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(() => '#63b3ed')
      .pointRadius(0.4)
      .pointAltitude(0);

    this.updatePoint();
  }

  ngOnChanges(): void {
    this.updatePoint();
  }

  private updatePoint(): void {
    if (!this.globe) return;

    const hasLocation =
      this.lat != null && this.lng != null && !Number.isNaN(this.lat) && !Number.isNaN(this.lng);

    if (hasLocation) {
      const lat = Number(this.lat);
      const lng = Number(this.lng);
      this.globe.pointsData([{ lat, lng }]);
      this.globe.pointOfView({ lat, lng, altitude: 2.2 }, 800);
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
