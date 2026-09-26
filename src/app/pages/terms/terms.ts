import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_VERSION, AppVersion } from '../../config/version.config';
import { COPY } from '../../config/copy';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, Navbar, Footer],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {
  readonly appVersion: AppVersion = APP_VERSION;
  readonly t = COPY.terms;
}
