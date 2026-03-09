import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  inject,
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
      .showGraticules(false)
      .pointOfView({ lat: 0, lng: 0, altitude: 2.2 })
      .pointsData([])
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(() => '#63b3ed')
      .pointRadius(0.4)
      .pointAltitude(0);

    this.updatePoint();

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
