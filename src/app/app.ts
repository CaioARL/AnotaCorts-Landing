import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SeoService } from './services/seo.service';
import { Intro } from './shared/intro/intro';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Intro],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    inject(SeoService).init();
  }
}
