import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { CARTO_BASEMAPS_KEY } from '../../config/api.config';
import { LandingStats } from '../../pages/home/home';

/** URLs dos tiles raster da CARTO (servidores a/b/c), com a chave da conta. */
const cartoTiles = (style: 'dark_nolabels' | 'light_nolabels'): string[] =>
  ['a', 'b', 'c'].map(
    (s) =>
      `https://${s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}@2x.png?key=${CARTO_BASEMAPS_KEY}`,
  );

export const BRAZIL_STATE_COORDS: Record<string, { name: string; coords: [number, number] }> = {
  SP: { name: 'São Paulo', coords: [-46.6333, -23.5505] },
  RJ: { name: 'Rio de Janeiro', coords: [-43.1729, -22.9068] },
  MG: { name: 'Minas Gerais', coords: [-43.9378, -19.9208] },
  BA: { name: 'Bahia', coords: [-38.5108, -12.9777] },
  PR: { name: 'Paraná', coords: [-49.2731, -25.4284] },
  CE: { name: 'Ceará', coords: [-38.5267, -3.7319] },
  PE: { name: 'Pernambuco', coords: [-34.877, -8.0578] },
  SC: { name: 'Santa Catarina', coords: [-48.548, -27.5954] },
  PA: { name: 'Pará', coords: [-48.5044, -1.4558] },
  AM: { name: 'Amazonas', coords: [-60.0217, -3.119] },
  ES: { name: 'Espírito Santo', coords: [-40.3377, -20.3155] },
  GO: { name: 'Goiás', coords: [-49.2648, -16.6869] },
  RS: { name: 'Rio Grande do Sul', coords: [-51.2177, -30.0346] },
  MA: { name: 'Maranhão', coords: [-44.3028, -2.5307] },
  MT: { name: 'Mato Grosso', coords: [-56.0969, -15.6014] },
  MS: { name: 'Mato Grosso do Sul', coords: [-54.6201, -20.4697] },
  PB: { name: 'Paraíba', coords: [-34.8641, -7.115] },
  PI: { name: 'Piauí', coords: [-42.8016, -5.092] },
  RN: { name: 'Rio Grande do Norte', coords: [-35.2094, -5.7945] },
  AL: { name: 'Alagoas', coords: [-35.7089, -9.6658] },
  SE: { name: 'Sergipe', coords: [-37.0731, -10.9472] },
  DF: { name: 'Distrito Federal', coords: [-47.9292, -15.7801] },
  AC: { name: 'Acre', coords: [-67.8243, -9.9753] },
  RO: { name: 'Rondônia', coords: [-63.9039, -8.7619] },
  TO: { name: 'Tocantins', coords: [-48.3277, -10.1844] },
  AP: { name: 'Amapá', coords: [-51.0694, 0.0389] },
};

const ARC_CONNECTIONS: [string, string][] = [
  ['SP', 'RJ'], ['SP', 'MG'], ['SP', 'PR'], ['SP', 'BA'], ['SP', 'GO'],
  ['SP', 'AM'], ['SP', 'PA'], ['SP', 'MA'], ['SP', 'CE'], ['SP', 'PE'],
  ['RJ', 'MG'], ['RJ', 'ES'], ['RJ', 'BA'],
  ['MG', 'GO'], ['MG', 'DF'], ['MG', 'BA'],
  ['BA', 'PE'], ['BA', 'CE'], ['BA', 'PI'], ['BA', 'SE'], ['BA', 'AL'],
  ['CE', 'PB'], ['CE', 'RN'], ['CE', 'PE'],
  ['PE', 'AL'], ['PE', 'PB'],
  ['PA', 'AM'], ['PA', 'AP'], ['PA', 'TO'], ['PA', 'MA'],
  ['AM', 'AC'], ['AM', 'RO'], ['AM', 'MT'],
  ['PR', 'SC'], ['SC', 'RS'], ['RS', 'MS'],
  ['MS', 'MT'], ['MS', 'GO'], ['GO', 'DF'], ['GO', 'TO'],
  ['MT', 'RO'], ['PI', 'MA'], ['PI', 'TO'],
];

@Component({
  selector: 'app-globe-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './globe-map.html',
  styleUrl: './globe-map.css',
})
export class GlobeMap implements AfterViewInit, OnChanges, OnDestroy {
  @Input() stats: LandingStats | null = null;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('arcsCanvas', { static: false }) arcsCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('markersOverlay', { static: false }) markersOverlayRef!: ElementRef<HTMLDivElement>;

  currentTheme: 'dark' | 'light' = 'dark';

  private map: maplibregl.Map | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private animFrameId: number | null = null;
  private dashOffset = 0;
  private markerElements = new Map<string, HTMLElement>();

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 50);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && this.map) {
      this.rebuildMarkerDOM();
      this.updatePositions();
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.markerElements.clear();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  setTheme(theme: 'dark' | 'light'): void {
    if (this.currentTheme === theme) return;
    this.currentTheme = theme;

    if (this.map && this.map.isStyleLoaded()) {
      this.map.setLayoutProperty('dark-layer', 'visibility', theme === 'dark' ? 'visible' : 'none');
      this.map.setLayoutProperty('light-layer', 'visibility', theme === 'light' ? 'visible' : 'none');
    }
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    try {
      const styleConfig: maplibregl.StyleSpecification = {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: cartoTiles('dark_nolabels'),
            tileSize: 256,
            attribution: '© CARTO, © OpenStreetMap',
          },
          'carto-light': {
            type: 'raster',
            tiles: cartoTiles('light_nolabels'),
            tileSize: 256,
            attribution: '© CARTO, © OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
            layout: {
              visibility: this.currentTheme === 'dark' ? 'visible' : 'none',
            },
          },
          {
            id: 'light-layer',
            type: 'raster',
            source: 'carto-light',
            minzoom: 0,
            maxzoom: 19,
            layout: {
              visibility: this.currentTheme === 'light' ? 'visible' : 'none',
            },
          },
        ],
      };

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const initialZoom = isMobile ? (window.innerWidth < 480 ? 1.65 : 1.85) : 2.45;

      const mapInstance = new maplibregl.Map({
        container: this.mapContainer.nativeElement,
        style: styleConfig,
        center: [-51.9, -14.2],
        zoom: initialZoom,
        minZoom: 1.0,
        maxZoom: 6,
        // A CARTO exige o crédito "© CARTO, © OpenStreetMap" visível; fica recolhido num ícone "i"
        attributionControl: { compact: true },
        scrollZoom: true,
        dragPan: true,
      });

      mapInstance.on('load', () => {
        try {
          mapInstance.setProjection({ type: 'globe' });
        } catch {
          // fallback
        }
        this.map = mapInstance;
        mapInstance.resize();
        this.setupCanvas();
        this.rebuildMarkerDOM();
        this.updatePositions();
        this.startLoop();
      });

      mapInstance.on('idle', () => {
        this.setupCanvas();
        this.updatePositions();
      });

      mapInstance.on('move', () => this.updatePositions());
      mapInstance.on('zoom', () => this.updatePositions());
      mapInstance.on('rotate', () => this.updatePositions());

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.map?.resize();
          this.setupCanvas();
          this.updatePositions();
        });
        this.resizeObserver.observe(this.mapContainer.nativeElement);
      }

      if (typeof IntersectionObserver !== 'undefined') {
        this.intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.map?.resize();
              this.setupCanvas();
              this.updatePositions();
            }
          });
        });
        this.intersectionObserver.observe(this.mapContainer.nativeElement);
      }
    } catch (e) {
      console.warn('MapLibre init failed:', e);
    }
  }

  private setupCanvas(): void {
    const canvas = this.arcsCanvasRef?.nativeElement;
    const container = this.mapContainer?.nativeElement;
    if (!canvas || !container) return;

    const width = container.offsetWidth || 980;
    const height = container.offsetHeight || 683;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  }

  private rebuildMarkerDOM(): void {
    const overlay = this.markersOverlayRef?.nativeElement;
    if (!overlay) return;

    overlay.innerHTML = '';
    this.markerElements.clear();

    const stateData = this.getStateData();

    Object.entries(stateData).forEach(([uf, count]) => {
      const ufUpper = uf.toUpperCase();
      const stateInfo = BRAZIL_STATE_COORDS[ufUpper];
      if (!stateInfo) return;

      const isHub = ufUpper === 'SP';
      const marker = document.createElement('div');
      marker.className = `globe-state-marker ${isHub ? 'hub' : ''} hidden`;
      marker.innerHTML = `
        <div class="marker-pulse-ring"></div>
        <div class="marker-pin-dot"></div>
        <div class="marker-badge-tag">${ufUpper} <span class="badge-count">${count}</span></div>
      `;

      overlay.appendChild(marker);
      this.markerElements.set(ufUpper, marker);
    });
  }

  private updatePositions(): void {
    if (!this.map) return;

    const stateData = this.getStateData();

    Object.keys(stateData).forEach((uf) => {
      const ufUpper = uf.toUpperCase();
      const stateInfo = BRAZIL_STATE_COORDS[ufUpper];
      const markerEl = this.markerElements.get(ufUpper);
      if (!stateInfo || !markerEl) return;

      const isVisible = this.isPointVisible(stateInfo.coords);
      if (!isVisible) {
        markerEl.classList.add('hidden');
        return;
      }

      try {
        const point = this.map!.project(stateInfo.coords);
        if (point && !isNaN(point.x) && !isNaN(point.y)) {
          markerEl.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
          markerEl.classList.remove('hidden');
        }
      } catch {
        // projection in progress
      }
    });
  }

  private startLoop = (): void => {
    this.updatePositions();
    this.drawArcs();
    this.animFrameId = requestAnimationFrame(this.startLoop);
  };

  private drawArcs(): void {
    const canvas = this.arcsCanvasRef?.nativeElement;
    if (!canvas || !this.map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.dashOffset -= 0.35;

    ctx.save();
    ctx.scale(dpr, dpr);

    const isLight = this.currentTheme === 'light';

    ARC_CONNECTIONS.forEach(([from, to]) => {
      const fromInfo = BRAZIL_STATE_COORDS[from];
      const toInfo = BRAZIL_STATE_COORDS[to];
      if (!fromInfo || !toInfo) return;

      const fromVisible = this.isPointVisible(fromInfo.coords);
      const toVisible = this.isPointVisible(toInfo.coords);

      if (!fromVisible && !toVisible) return;

      try {
        const p1 = this.map!.project(fromInfo.coords);
        const p2 = this.map!.project(toInfo.coords);

        if (!p1 || !p2 || isNaN(p1.x) || isNaN(p2.x)) return;

        // Midpoint and perpendicular displacement for smooth curvature
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 4) return;

        const curvature = Math.min(dist * 0.22, 45);
        const nx = -dy / dist;
        const ny = dx / dist;

        // Arc control point
        const cx = mx + nx * curvature;
        const cy = my + ny * curvature;

        // Outer glow line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.strokeStyle = isLight ? 'rgba(31, 51, 212, 0.22)' : 'rgba(31, 51, 212, 0.4)';
        ctx.lineWidth = isLight ? 2.5 : 3;
        ctx.setLineDash([]);
        ctx.stroke();

        // Inner animated dashed line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.strokeStyle = isLight ? '#1f33d4' : '#60a5fa';
        ctx.lineWidth = isLight ? 1.8 : 1.6;
        ctx.setLineDash([5, 4]);
        ctx.lineDashOffset = this.dashOffset;
        ctx.stroke();
      } catch {
        // projection in progress
      }
    });

    ctx.restore();
  }

  private isPointVisible(coords: [number, number]): boolean {
    if (!this.map) return false;
    const center = this.map.getCenter();
    const rad = Math.PI / 180;
    const lat1 = center.lat * rad;
    const lat2 = coords[1] * rad;
    const dLng = (coords[0] - center.lng) * rad;

    const cosDist = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return cosDist > 0.08;
  }

  private getStateData(): Record<string, number> {
    if (this.stats?.barbeariasPorEstado) {
      return this.stats.barbeariasPorEstado as Record<string, number>;
    }
    return {
      SP: 100, MG: 25, BA: 20, PE: 18, PR: 17, CE: 16, RJ: 15,
      PA: 13, AM: 11, SC: 11, ES: 9, PI: 9, GO: 8, RS: 8, MA: 7,
      MT: 6, PB: 5, AL: 4, MS: 4, SE: 4, AC: 3, DF: 3, RN: 3,
      RO: 2, TO: 2, AP: 1,
    };
  }
}
