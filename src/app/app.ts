import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AnalyticsService } from './services/analytics.service';
import { SeoService } from './services/seo.service';
import { ConsentBanner } from './shared/consent-banner/consent-banner';
import { Intro } from './shared/intro/intro';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Intro, ConsentBanner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    inject(SeoService).init();
    inject(AnalyticsService).init();
  }
}
