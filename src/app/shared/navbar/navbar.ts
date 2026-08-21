import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { COPY } from '../../config/copy';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly brand = COPY.brand;
  readonly links = COPY.nav.links;
  readonly mobileOpen = signal(false);
  readonly isScrolled = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScroll();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScroll();
    }
  }

  private checkScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggle(): void {
    this.mobileOpen.update((v) => !v);
  }

  close(): void {
    this.mobileOpen.set(false);
  }
}
