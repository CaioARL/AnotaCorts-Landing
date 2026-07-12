import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COPY } from '../../config/copy';
import { APP_VERSION, AppVersion } from '../../config/version.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly brand = COPY.brand;
  readonly t = COPY.footer;
  readonly appVersion: AppVersion = APP_VERSION;
}
