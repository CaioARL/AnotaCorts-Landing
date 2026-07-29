import { Component } from '@angular/core';
import { APP_VERSION, AppVersion } from '../../config/version.config';
import { COPY } from '../../config/copy';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-privacy',
  imports: [Navbar, Footer],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy {
  readonly appVersion: AppVersion = APP_VERSION;
  readonly t = COPY.privacy;
}
