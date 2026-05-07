import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_VERSION, AppVersion } from '../../config/version.config';

@Component({
  selector: 'app-terms',
  imports: [RouterLink],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {
  readonly appVersion: AppVersion = APP_VERSION;
}
