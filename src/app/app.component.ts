import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobeComponent } from './globe/globe.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GlobeComponent],
  template: `
    <div class="page">
      <div class="bg">
        <div class="bg-gradient bg-gradient--flow"></div>
        <div class="bg-gradient bg-gradient--overlay"></div>
        @for (orb of orbs; track orb.id) {
          <div class="orb" [style.--delay]="orb.delay + 's'" [style.--x]="orb.x" [style.--y]="orb.y" [style.--size]="orb.size + 'px'"></div>
        }
        <div class="bg-shine"></div>
      </div>
      <div class="clock-container">
        <div class="clock-card">
          <h1>{{ selectedTimezone === null ? 'Current Local Time' : timezoneLabel }}</h1>
          <div class="time-wrapper">
            <div class="time" [class.time-flip]="isFlipping">{{ currentTime }}</div>
          </div>
          <div class="date">{{ currentDate }}</div>
          <div class="timezone">{{ timezone }}</div>
        </div>
        <div class="controls">
          <div class="controls-row">
            <button type="button" class="format-btn" (click)="toggleFormat()" [class.format-btn--active]="!use24Hour">
              {{ use24Hour ? '12‑hour' : '24‑hour' }}
            </button>
            <button type="button" class="tz-btn" (click)="toggleTzPanel()" [class.tz-btn--open]="tzPanelOpen" title="Select time zone">
              <span class="tz-btn-icon">🌐</span>
              <span class="tz-btn-label">{{ timezoneLabel }}</span>
            </button>
          </div>
          @if (tzPanelOpen) {
            <div class="tz-panel">
              <button type="button" class="tz-option" (click)="selectTimezone(null)">
                Local
              </button>
              @for (opt of timezoneOptions; track opt.tz) {
                <button type="button" class="tz-option" (click)="selectTimezone(opt.tz)">
                  {{ opt.label }}
                </button>
              }
            </div>
          }
        </div>
        @if (selectedLat != null && selectedLng != null) {
          <div class="globe-wrapper">
            <app-globe [lat]="selectedLat" [lng]="selectedLng"></app-globe>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }
    .bg {
      position: absolute;
      inset: 0;
      background: #16161e;
    }
    .bg-gradient {
      position: absolute;
      inset: 0;
    }
    .bg-gradient--flow {
      background: linear-gradient(
        90deg,
        #2d1b4e 0%,
        #1a5276 25%,
        #1e8449 50%,
        #b7950b 75%,
        #922b21 100%,
        #2d1b4e 100%
      );
      background-size: 400% 100%;
      animation: gradientFlow 25s ease-in-out infinite;
    }
    .bg-gradient--overlay {
      background: linear-gradient(
        160deg,
        transparent 0%,
        rgba(255, 255, 255, 0.04) 50%,
        transparent 100%
      );
      background-size: 100% 200%;
      animation: overlayMove 20s ease-in-out infinite;
    }
    @keyframes gradientFlow {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes overlayMove {
      0%, 100% { background-position: 50% 0%; }
      50% { background-position: 50% 100%; }
    }
    .orb {
      position: absolute;
      left: var(--x);
      top: var(--y);
      width: var(--size);
      height: var(--size);
      border-radius: 50%;
      background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.2),
        rgba(0, 0, 0, 0.1)
      );
      filter: blur(50px);
      animation: orbFloat 18s ease-in-out infinite;
      animation-delay: var(--delay);
    }
    @keyframes orbFloat {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
      25% { transform: translate(30px, -40px) scale(1.1); opacity: 1; }
      50% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.7; }
      75% { transform: translate(40px, 30px) scale(1.05); opacity: 0.9; }
    }
    .bg-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        transparent 0%,
        rgba(255, 255, 255, 0.02) 40%,
        rgba(255, 255, 255, 0.04) 50%,
        transparent 60%
      );
      background-size: 200% 100%;
      animation: shine 8s linear infinite;
    }
    @keyframes shine {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .clock-container {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .clock-card {
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #f5f5f5;
      padding: 2rem 3rem;
      border-radius: 1rem;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.4);
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin: 0 0 1rem 0;
      opacity: 0.95;
    }
    .time-wrapper {
      display: inline-block;
    }
    .time {
      font-size: 4rem;
      font-weight: 200;
      letter-spacing: 0.05em;
      font-variant-numeric: tabular-nums;
      display: inline-block;
    }
    .time.time-flip {
      animation: timeTransition 0.35s ease-out forwards;
    }
    @keyframes timeTransition {
      0% { transform: scale(1); opacity: 1; }
      40% { transform: scale(1.04); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    .date {
      font-size: 1.25rem;
      margin-top: 0.5rem;
      opacity: 0.9;
    }
    .timezone {
      font-size: 0.9rem;
      margin-top: 0.25rem;
      opacity: 0.85;
    }
    .controls {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .controls-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    .format-btn,
    .tz-btn {
      padding: 0.65rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #f5f5f5;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 999px;
      cursor: pointer;
      transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }
    .format-btn:hover,
    .tz-btn:hover {
      background: rgba(0, 0, 0, 0.65);
      transform: scale(1.03);
    }
    .format-btn:active,
    .tz-btn:active {
      transform: scale(0.98);
    }
    .format-btn--active {
      background: rgba(99, 179, 237, 0.4);
      border-color: rgba(99, 179, 237, 0.7);
      box-shadow: 0 0 20px rgba(99, 179, 237, 0.3);
    }
    .tz-btn--open {
      background: rgba(0, 0, 0, 0.65);
      border-color: rgba(255, 255, 255, 0.4);
    }
    .tz-btn-icon {
      margin-right: 0.35rem;
    }
    .tz-btn-label {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tz-panel {
      display: flex;
      flex-direction: column;
      max-height: 220px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
    .tz-option {
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      color: #f5f5f5;
      background: transparent;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease;
    }
    .tz-option:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .globe-wrapper {
      margin-top: 1.5rem;
      width: 100%;
      max-width: 320px;
      height: 240px;
      border-radius: 0.75rem;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.3);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  currentTime = '';
  currentDate = '';
  timezone = '';
  use24Hour = true;
  isFlipping = false;
  selectedTimezone: string | null = null;
  tzPanelOpen = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  timezoneOptions: { tz: string; label: string }[] = [
    { tz: 'America/New_York', label: 'United States (Eastern)' },
    { tz: 'America/Chicago', label: 'United States (Central)' },
    { tz: 'America/Denver', label: 'United States (Mountain)' },
    { tz: 'America/Los_Angeles', label: 'United States (Pacific)' },
    { tz: 'Europe/London', label: 'United Kingdom' },
    { tz: 'Europe/Paris', label: 'France' },
    { tz: 'Europe/Berlin', label: 'Germany' },
    { tz: 'Europe/Moscow', label: 'Russia (Moscow)' },
    { tz: 'Asia/Tokyo', label: 'Japan' },
    { tz: 'Asia/Shanghai', label: 'China' },
    { tz: 'Asia/Kolkata', label: 'India' },
    { tz: 'Australia/Sydney', label: 'Australia (Sydney)' },
    { tz: 'America/Sao_Paulo', label: 'Brazil (São Paulo)' },
    { tz: 'Africa/Cairo', label: 'Egypt' },
    { tz: 'Africa/Johannesburg', label: 'South Africa' },
    { tz: 'Africa/Lagos', label: 'Nigeria' },
    { tz: 'Africa/Accra', label: 'Ghana' },
    { tz: 'Africa/Dakar', label: 'Senegal' },
    { tz: 'Africa/Abidjan', label: 'Ivory Coast' },
    { tz: 'Africa/Bamako', label: 'Mali' },
    { tz: 'Africa/Ouagadougou', label: 'Burkina Faso' },
    { tz: 'Africa/Porto-Novo', label: 'Benin' },
    { tz: 'Africa/Lome', label: 'Togo' },
    { tz: 'Africa/Niamey', label: 'Niger' },
    { tz: 'Africa/Douala', label: 'Cameroon' },
    { tz: 'Africa/Conakry', label: 'Guinea' },
    { tz: 'Africa/Freetown', label: 'Sierra Leone' },
    { tz: 'Africa/Monrovia', label: 'Liberia' },
    { tz: 'Africa/Nouakchott', label: 'Mauritania' },
    { tz: 'Africa/Banjul', label: 'Gambia' },
    { tz: 'Africa/Bissau', label: 'Guinea-Bissau' },
  ];

  get timezoneLabel(): string {
    if (this.selectedTimezone === null) return 'Local';
    const opt = this.timezoneOptions.find((o) => o.tz === this.selectedTimezone);
    return opt ? opt.label : this.timezone;
  }

  /** Approximate [lat, lng] for each timezone (capital or major city). */
  private static readonly TIMEZONE_COORDS: Record<string, [number, number]> = {
    'America/New_York': [40.71, -74.01],
    'America/Chicago': [41.88, -87.63],
    'America/Denver': [39.74, -104.99],
    'America/Los_Angeles': [34.05, -118.24],
    'Europe/London': [51.51, -0.13],
    'Europe/Paris': [48.86, 2.35],
    'Europe/Berlin': [52.52, 13.41],
    'Europe/Moscow': [55.76, 37.62],
    'Asia/Tokyo': [35.68, 139.69],
    'Asia/Shanghai': [31.23, 121.47],
    'Asia/Kolkata': [28.61, 77.21],
    'Australia/Sydney': [-33.87, 151.21],
    'America/Sao_Paulo': [-23.55, -46.63],
    'Africa/Cairo': [30.04, 31.24],
    'Africa/Johannesburg': [-26.2, 28.04],
    'Africa/Lagos': [6.45, 3.4],
    'Africa/Accra': [5.6, -0.19],
    'Africa/Dakar': [14.72, -17.47],
    'Africa/Abidjan': [5.36, -4.01],
    'Africa/Bamako': [12.64, -8.0],
    'Africa/Ouagadougou': [12.37, -1.53],
    'Africa/Porto-Novo': [6.5, 2.63],
    'Africa/Lome': [6.13, 1.22],
    'Africa/Niamey': [13.51, 2.11],
    'Africa/Douala': [4.05, 9.7],
    'Africa/Conakry': [9.54, -13.68],
    'Africa/Freetown': [8.48, -13.23],
    'Africa/Monrovia': [6.32, -10.8],
    'Africa/Nouakchott': [18.07, -15.96],
    'Africa/Banjul': [13.45, -16.58],
    'Africa/Bissau': [11.86, -15.6],
  };

  get selectedLat(): number | null {
    if (this.selectedTimezone === null) return null;
    const coords = AppComponent.TIMEZONE_COORDS[this.selectedTimezone];
    return coords ? coords[0] : null;
  }

  get selectedLng(): number | null {
    if (this.selectedTimezone === null) return null;
    const coords = AppComponent.TIMEZONE_COORDS[this.selectedTimezone];
    return coords ? coords[1] : null;
  }

  orbs = [
    { id: 1, delay: 0, x: '15%', y: '20%', size: 280 },
    { id: 2, delay: -4, x: '70%', y: '60%', size: 200 },
    { id: 3, delay: -8, x: '50%', y: '80%', size: 160 },
    { id: 4, delay: -12, x: '85%', y: '15%', size: 220 },
    { id: 5, delay: -2, x: '25%', y: '70%', size: 180 },
  ];

  ngOnInit(): void {
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleFormat(): void {
    this.use24Hour = !this.use24Hour;
    this.updateTime();
    this.isFlipping = true;
    setTimeout(() => {
      this.isFlipping = false;
    }, 350);
  }

  toggleTzPanel(): void {
    this.tzPanelOpen = !this.tzPanelOpen;
  }

  selectTimezone(tz: string | null): void {
    this.selectedTimezone = tz;
    this.tzPanelOpen = false;
    this.updateTime();
    this.isFlipping = true;
    setTimeout(() => {
      this.isFlipping = false;
    }, 350);
  }

  private updateTime(): void {
    const now = new Date();
    const locale = undefined;
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !this.use24Hour,
      timeZone: this.selectedTimezone ?? undefined,
    };
    this.currentTime = now.toLocaleTimeString(locale, options);
    this.currentDate = now.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: this.selectedTimezone ?? undefined,
    });
    this.timezone = this.selectedTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}
