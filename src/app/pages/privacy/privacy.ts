import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_VERSION, AppVersion } from '../../config/version.config';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy {
  readonly appVersion: AppVersion = APP_VERSION;
}
