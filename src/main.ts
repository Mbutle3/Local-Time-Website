import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Suppress THREE.Clock deprecation warning from globe.gl's dependency on three.js
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
  if (msg.includes('THREE.Clock') && msg.includes('deprecated') && msg.includes('THREE.Timer')) {
    return;
  }
  originalWarn.apply(console, args);
};

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
