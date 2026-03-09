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
          @if (selectedCity) {
            <p class="selected-city">Time in {{ selectedCity.name }}</p>
          }
          <div class="time-wrapper">
            <div class="time" [class.time-flip]="isFlipping">{{ currentTime }}</div>
          </div>
          <div class="date">{{ currentDate }}</div>
          <div class="timezone">{{ timezone }}</div>
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
        </div>
        @if (selectedLat != null && selectedLng != null) {
          <app-globe
            [lat]="selectedLat"
            [lng]="selectedLng"
            [cities]="selectedTimezoneCities"
            [selectedCity]="selectedCity"
            (cityClick)="onCitySelect($event)"
          ></app-globe>
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
      overflow-y: scroll;
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
      padding: 2rem 1rem;
      margin: 0;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .clock-card {
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #f5f5f5;
      padding: 2.25rem 3.5rem;
      min-width: 320px;
      max-width: 420px;
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
    .selected-city {
      font-size: 0.95rem;
      margin: 0.25rem 0 0;
      opacity: 0.9;
      color: #93c5fd;
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
    app-globe {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 260px;
      max-height: 260px;
      margin: 1rem 0;
      flex-shrink: 0;
      min-height: 280px;
      text-align: center;
      vertical-align: middle;
      border-radius: 0.5rem;
      overflow: visible;
    }
    @media (min-height: 1200px) {
      app-globe {
        min-height: 38vh;
        max-width: 320px;
        max-height: 320px;
      }
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
  /** City selected by clicking a pin on the globe (shows "Time in {name}"). */
  selectedCity: { lat: number; lng: number; name: string } | null = null;
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

  /** Notable cities in each timezone (for globe markers). */
  private static readonly TIMEZONE_CITIES: Record<string, { lat: number; lng: number; name: string }[]> = {
    'America/New_York': [
      { lat: 40.71, lng: -74.01, name: 'New York' },
      { lat: 40.44, lng: -79.99, name: 'Pittsburgh' },
      { lat: 42.36, lng: -71.06, name: 'Boston' },
      { lat: 39.95, lng: -75.17, name: 'Philadelphia' },
      { lat: 38.91, lng: -77.04, name: 'Washington, D.C.' },
      { lat: 25.76, lng: -80.19, name: 'Miami' },
      { lat: 43.65, lng: -79.38, name: 'Toronto' },
    ],
    'America/Chicago': [
      { lat: 41.88, lng: -87.63, name: 'Chicago' },
      { lat: 29.76, lng: -95.37, name: 'Houston' },
      { lat: 29.95, lng: -90.07, name: 'New Orleans' },
      { lat: 35.23, lng: -80.84, name: 'Charlotte' },
      { lat: 44.98, lng: -93.27, name: 'Minneapolis' },
      { lat: 35.15, lng: -90.05, name: 'Memphis' },
    ],
    'America/Denver': [
      { lat: 39.74, lng: -104.99, name: 'Denver' },
      { lat: 33.45, lng: -112.07, name: 'Phoenix' },
      { lat: 35.08, lng: -106.65, name: 'Albuquerque' },
      { lat: 40.76, lng: -111.89, name: 'Salt Lake City' },
      { lat: 51.04, lng: -114.07, name: 'Calgary' },
    ],
    'America/Los_Angeles': [
      { lat: 34.05, lng: -118.24, name: 'Los Angeles' },
      { lat: 37.77, lng: -122.42, name: 'San Francisco' },
      { lat: 32.72, lng: -117.16, name: 'San Diego' },
      { lat: 36.17, lng: -115.14, name: 'Las Vegas' },
      { lat: 49.28, lng: -123.12, name: 'Vancouver' },
      { lat: 47.61, lng: -122.33, name: 'Seattle' },
    ],
    'Europe/London': [
      { lat: 51.51, lng: -0.13, name: 'London' },
      { lat: 53.48, lng: -2.24, name: 'Manchester' },
      { lat: 55.86, lng: -4.25, name: 'Glasgow' },
      { lat: 53.35, lng: -6.26, name: 'Dublin' },
      { lat: 51.45, lng: -2.58, name: 'Bristol' },
    ],
    'Europe/Paris': [
      { lat: 48.86, lng: 2.35, name: 'Paris' },
      { lat: 45.76, lng: 4.84, name: 'Lyon' },
      { lat: 43.3, lng: 5.37, name: 'Marseille' },
      { lat: 50.85, lng: 4.35, name: 'Brussels' },
      { lat: 49.61, lng: 6.13, name: 'Luxembourg' },
    ],
    'Europe/Berlin': [
      { lat: 52.52, lng: 13.41, name: 'Berlin' },
      { lat: 48.14, lng: 11.58, name: 'Munich' },
      { lat: 50.94, lng: 6.96, name: 'Cologne' },
      { lat: 53.55, lng: 9.99, name: 'Hamburg' },
      { lat: 50.08, lng: 14.42, name: 'Prague' },
      { lat: 52.23, lng: 21.01, name: 'Warsaw' },
    ],
    'Europe/Moscow': [
      { lat: 55.76, lng: 37.62, name: 'Moscow' },
      { lat: 59.93, lng: 30.31, name: 'Saint Petersburg' },
      { lat: 56.95, lng: 24.11, name: 'Riga' },
      { lat: 54.69, lng: 25.28, name: 'Vilnius' },
      { lat: 53.9, lng: 27.57, name: 'Minsk' },
    ],
    'Asia/Tokyo': [
      { lat: 35.68, lng: 139.69, name: 'Tokyo' },
      { lat: 34.69, lng: 135.5, name: 'Osaka' },
      { lat: 35.01, lng: 135.77, name: 'Kyoto' },
      { lat: 43.06, lng: 141.35, name: 'Sapporo' },
      { lat: 26.21, lng: 127.68, name: 'Okinawa' },
    ],
    'Asia/Shanghai': [
      { lat: 31.23, lng: 121.47, name: 'Shanghai' },
      { lat: 39.9, lng: 116.41, name: 'Beijing' },
      { lat: 22.28, lng: 114.16, name: 'Hong Kong' },
      { lat: 30.57, lng: 104.07, name: 'Chengdu' },
      { lat: 22.55, lng: 114.1, name: 'Shenzhen' },
    ],
    'Asia/Kolkata': [
      { lat: 28.61, lng: 77.21, name: 'New Delhi' },
      { lat: 19.08, lng: 72.88, name: 'Mumbai' },
      { lat: 13.08, lng: 80.27, name: 'Chennai' },
      { lat: 22.57, lng: 88.36, name: 'Kolkata' },
      { lat: 26.91, lng: 75.79, name: 'Jaipur' },
      { lat: 8.52, lng: 76.93, name: 'Thiruvananthapuram' },
    ],
    'Australia/Sydney': [
      { lat: -33.87, lng: 151.21, name: 'Sydney' },
      { lat: -37.81, lng: 144.96, name: 'Melbourne' },
      { lat: -27.47, lng: 153.03, name: 'Brisbane' },
      { lat: -31.95, lng: 115.86, name: 'Perth' },
      { lat: -34.93, lng: 138.6, name: 'Adelaide' },
      { lat: -36.85, lng: 174.76, name: 'Auckland' },
    ],
    'America/Sao_Paulo': [
      { lat: -23.55, lng: -46.63, name: 'São Paulo' },
      { lat: -22.91, lng: -43.17, name: 'Rio de Janeiro' },
      { lat: -15.79, lng: -47.88, name: 'Brasília' },
      { lat: -25.43, lng: -49.27, name: 'Curitiba' },
      { lat: -34.9, lng: -56.16, name: 'Montevideo' },
    ],
    'Africa/Cairo': [
      { lat: 30.04, lng: 31.24, name: 'Cairo' },
      { lat: 31.2, lng: 29.92, name: 'Alexandria' },
      { lat: 32.09, lng: 34.78, name: 'Tel Aviv' },
      { lat: 31.95, lng: 35.93, name: 'Amman' },
      { lat: 33.89, lng: 35.49, name: 'Beirut' },
    ],
    'Africa/Johannesburg': [
      { lat: -26.2, lng: 28.04, name: 'Johannesburg' },
      { lat: -33.92, lng: 18.42, name: 'Cape Town' },
      { lat: -29.86, lng: 31.03, name: 'Durban' },
      { lat: -15.78, lng: 35.0, name: 'Lilongwe' },
      { lat: -17.83, lng: 31.05, name: 'Harare' },
    ],
    'Africa/Lagos': [
      { lat: 6.45, lng: 3.4, name: 'Lagos' },
      { lat: 6.52, lng: 3.38, name: 'Ikeja' },
      { lat: 9.08, lng: 7.4, name: 'Abuja' },
      { lat: 6.34, lng: 5.6, name: 'Benin City' },
      { lat: 4.82, lng: 7.0, name: 'Port Harcourt' },
    ],
    'Africa/Accra': [
      { lat: 5.6, lng: -0.19, name: 'Accra' },
      { lat: 6.69, lng: -1.62, name: 'Kumasi' },
      { lat: 5.56, lng: -0.21, name: 'Tema' },
    ],
    'Africa/Dakar': [
      { lat: 14.72, lng: -17.47, name: 'Dakar' },
      { lat: 14.69, lng: -17.45, name: 'Pikine' },
      { lat: 12.65, lng: -8.0, name: 'Bamako (Mali)' },
    ],
    'Africa/Abidjan': [
      { lat: 5.36, lng: -4.01, name: 'Abidjan' },
      { lat: 6.85, lng: -5.36, name: 'Yamoussoukro' },
      { lat: 7.69, lng: -5.03, name: 'Bouaké' },
    ],
    'Africa/Bamako': [
      { lat: 12.64, lng: -8.0, name: 'Bamako' },
      { lat: 13.45, lng: -6.26, name: 'Ségou' },
    ],
    'Africa/Ouagadougou': [
      { lat: 12.37, lng: -1.53, name: 'Ouagadougou' },
      { lat: 12.24, lng: -2.1, name: 'Bobo-Dioulasso' },
    ],
    'Africa/Porto-Novo': [
      { lat: 6.5, lng: 2.63, name: 'Porto-Novo' },
      { lat: 6.37, lng: 2.42, name: 'Cotonou' },
    ],
    'Africa/Lome': [
      { lat: 6.13, lng: 1.22, name: 'Lomé' },
      { lat: 6.14, lng: 1.21, name: 'Sokodé' },
    ],
    'Africa/Niamey': [
      { lat: 13.51, lng: 2.11, name: 'Niamey' },
      { lat: 13.52, lng: 2.11, name: 'Zinder' },
    ],
    'Africa/Douala': [
      { lat: 4.05, lng: 9.7, name: 'Douala' },
      { lat: 3.87, lng: 11.52, name: 'Yaoundé' },
    ],
    'Africa/Conakry': [
      { lat: 9.54, lng: -13.68, name: 'Conakry' },
      { lat: 11.3, lng: -10.72, name: 'Kankan' },
    ],
    'Africa/Freetown': [
      { lat: 8.48, lng: -13.23, name: 'Freetown' },
      { lat: 8.44, lng: -13.23, name: 'Waterloo' },
    ],
    'Africa/Monrovia': [
      { lat: 6.32, lng: -10.8, name: 'Monrovia' },
      { lat: 6.3, lng: -10.8, name: 'Paynesville' },
    ],
    'Africa/Nouakchott': [
      { lat: 18.07, lng: -15.96, name: 'Nouakchott' },
      { lat: 16.04, lng: -16.49, name: 'Saint-Louis (Senegal)' },
    ],
    'Africa/Banjul': [
      { lat: 13.45, lng: -16.58, name: 'Banjul' },
      { lat: 13.45, lng: -16.68, name: 'Serekunda' },
    ],
    'Africa/Bissau': [
      { lat: 11.86, lng: -15.6, name: 'Bissau' },
      { lat: 12.0, lng: -15.47, name: 'Bafatá' },
    ],
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

  /** Notable cities in the selected timezone (for globe markers). */
  get selectedTimezoneCities(): { lat: number; lng: number; name: string }[] {
    if (this.selectedTimezone === null) return [];
    return AppComponent.TIMEZONE_CITIES[this.selectedTimezone] ?? [];
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

  onCitySelect(city: { lat: number; lng: number; name: string }): void {
    this.selectedCity = city;
  }

  selectTimezone(tz: string | null): void {
    this.selectedTimezone = tz;
    this.selectedCity = null;
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
