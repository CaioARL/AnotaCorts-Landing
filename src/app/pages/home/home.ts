import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_STORE_URLS, AppStoreUrls } from '../../config/app-store.config';
import { APP_VERSION, AppVersion } from '../../config/version.config';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly storeUrls: AppStoreUrls = APP_STORE_URLS;
  readonly appVersion: AppVersion = APP_VERSION;
}
