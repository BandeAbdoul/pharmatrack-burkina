// src/main.ts
import 'zone.js';  // ← IMPORTANT : Cette ligne doit être EN PREMIER
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));