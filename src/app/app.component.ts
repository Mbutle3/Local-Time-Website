import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clock-container">
      <h1>Current Local Time</h1>
      <div class="time">{{ currentTime }}</div>
      <div class="date">{{ currentDate }}</div>
      <div class="timezone">{{ timezone }}</div>
    </div>
  `,
  styles: [`
    .clock-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #e8e8e8;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 1rem;
      opacity: 0.9;
    }
    .time {
      font-size: 4rem;
      font-weight: 200;
      letter-spacing: 0.05em;
      font-variant-numeric: tabular-nums;
    }
    .date {
      font-size: 1.25rem;
      margin-top: 0.5rem;
      opacity: 0.85;
    }
    .timezone {
      font-size: 0.9rem;
      margin-top: 0.25rem;
      opacity: 0.7;
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  currentTime = '';
  currentDate = '';
  timezone = '';
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    this.currentDate = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}
