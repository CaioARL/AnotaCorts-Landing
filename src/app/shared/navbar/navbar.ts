import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { COPY } from '../../config/copy';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly brand = COPY.brand;
  readonly links = COPY.nav.links;
  readonly mobileOpen = signal(false);

  toggle(): void {
    this.mobileOpen.update((v) => !v);
  }

  close(): void {
    this.mobileOpen.set(false);
  }
}
