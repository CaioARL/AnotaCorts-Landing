import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

const SEEN_KEY = 'anotacorts-intro-seen';
/** Classe no <body> enquanto a abertura cobre a tela (pausa as animações de entrada). */
const PLAYING_CLASS = 'intro-playing';

/** Linha do tempo da abertura (ms). */
const FORM_MS = 900; // pontos espalhados se juntam no globo
const GLOBE_HOLD_MS = 700; // globo girando
const MORPH_MS = 1100; // globo vira Barber Pole
const POLE_HOLD_MS = 900; // Barber Pole girando
const FADE_START_MS = FORM_MS + GLOBE_HOLD_MS + MORPH_MS + POLE_HOLD_MS;

/** Cores das listras do Barber Pole e das partes cromadas das tampas. */
const STRIPE_COLORS = ['#ff2d4a', '#ffffff', '#7dd3fc'];
const RING_COLOR = '#e2e8f0';
const DOME_COLOR = '#cbd5e1';

/** Ponto do perfil da tampa: raio e altura a partir da ponta do cilindro. */
interface CapPoint {
  rho: number;
  y: number;
  dome: boolean;
}

interface Particle {
  /** Posição inicial (espalhada), no globo e no Barber Pole, em coordenadas 3D. */
  from: [number, number, number];
  globe: [number, number, number];
  pole: [number, number, number];
  poleColor: string;
}

/**
 * Abertura do site: milhares de pontinhos formam um globo girando, que se transforma num
 * Barber Pole (listras vermelha, branca e azul) antes de a camada sumir revelando a home.
 * Toca só ao abrir a home, uma vez por sessão, e nunca para quem pediu menos movimento ou
 * para robôs de busca.
 */
@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.css',
})
export class Intro {
  readonly visible = signal(false);
  readonly fadeDelay = `${FADE_START_MS}ms`;
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private frameId = 0;

  constructor() {
    if (!this.shouldPlay()) return;

    this.visible.set(true);
    this.rememberSeen();
    // Trava a rolagem da página enquanto a abertura cobre a tela, e segura as animações de
    // entrada da página (ver .intro-playing no styles.css) para elas tocarem quando a
    // abertura sair, e não escondidas por baixo dela
    document.body.style.overflow = 'hidden';
    document.body.classList.add(PLAYING_CLASS);
    afterNextRender(() => this.start());
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * A abertura terminou de sumir: remove a camada e libera as animações de entrada da página
   * (stop() tira a classe), que tocam inteiras à vista.
   */
  onAnimationEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget) return;
    this.stop();
    this.visible.set(false);
  }

  private stop(): void {
    cancelAnimationFrame(this.frameId);
    document.body.style.overflow = '';
    document.body.classList.remove(PLAYING_CLASS);
  }

  private start(): void {
    const canvas = this.canvas()?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const count = width < 640 ? 1500 : 2800;
    const radius = Math.min(width, height) * 0.27;
    // Medida-base do Barber Pole: com as tampas ele tem ~3,1× essa medida de altura
    const poleUnit = Math.min(radius, height * 0.23);
    const particles = this.buildParticles(count, radius, poleUnit);
    const focal = radius * 4;
    const start = performance.now();

    const draw = (now: number) => {
      const t = now - start;
      const form = ease(clamp(t / FORM_MS));
      const morph = ease(clamp((t - FORM_MS - GLOBE_HOLD_MS) / MORPH_MS));
      const spin = t * 0.0011; // giro em torno do eixo vertical
      const tilt = 0.35 * (1 - morph); // globo levemente inclinado, o Barber Pole fica em pé
      const cosS = Math.cos(spin);
      const sinS = Math.sin(spin);
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        // Espalhado → globo → Barber Pole
        let x = lerp(p.from[0], p.globe[0], form);
        let y = lerp(p.from[1], p.globe[1], form);
        let z = lerp(p.from[2], p.globe[2], form);
        x = lerp(x, p.pole[0], morph);
        y = lerp(y, p.pole[1], morph);
        z = lerp(z, p.pole[2], morph);

        // Rotação (giro + inclinação) e perspectiva
        const rx = x * cosS + z * sinS;
        const rz = -x * sinS + z * cosS;
        const ry = y * cosT - rz * sinT;
        const depth = y * sinT + rz * cosT;
        const scale = focal / (focal + depth);
        const sx = width / 2 + rx * scale;
        const sy = height / 2 + ry * scale;

        // Pontos de trás mais apagados, para dar volume
        const front = (radius - depth) / (2 * radius);
        ctx.globalAlpha = form * (0.25 + 0.75 * clamp(front));
        // Brancos no globo; ganham a cor da listra na metade da transformação
        ctx.fillStyle = morph < 0.5 ? '#ffffff' : p.poleColor;
        const size = (1.8 + morph * 1.2) * scale; // pontos crescem no Barber Pole
        ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      this.frameId = requestAnimationFrame(draw);
    };
    this.frameId = requestAnimationFrame(draw);
  }

  /**
   * Cada partícula tem um lugar no globo (esfera de Fibonacci) e um no Barber Pole, na mesma
   * ordem de altura e ângulo, então a transformação desliza os pontos sem cruzar a tela: o
   * meio do globo vira o cilindro listrado e os polos viram as tampas.
   */
  private buildParticles(count: number, radius: number, unit: number): Particle[] {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const poleRadius = unit * 0.42; // raio do cilindro listrado
    const poleHalf = unit; // metade da altura do cilindro
    const turns = 1.2; // voltas da espiral ao longo do Barber Pole
    const repeats = 1; // quantas vezes o trio vermelho-branco-azul aparece em volta
    const cap = buildCapProfile(poleRadius, unit);
    // Parte dos pontos vai para as tampas, na proporção da área delas, com um teto para o
    // cilindro listrado continuar bem preenchido
    const cylinderArea = 2 * Math.PI * poleRadius * 2 * poleHalf;
    const capShare = Math.min(0.4, (2 * cap.area) / (2 * cap.area + cylinderArea));
    const edge = 1 - capShare; // pontos do globo com |v| acima disso vão para as tampas
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const v = 1 - (2 * (i + 0.5)) / count; // de 1 (topo) a -1 (base)
      const theta = i * golden;
      const ring = Math.sqrt(1 - v * v);
      const globe: [number, number, number] = [
        Math.cos(theta) * ring * radius,
        -v * radius,
        Math.sin(theta) * ring * radius,
      ];

      // Polos do globo viram as tampas cromadas; o resto vira o cilindro listrado
      let pole: [number, number, number];
      let poleColor: string;
      if (Math.abs(v) > edge) {
        // 0 = junto do cilindro, 1 = ponta do domo
        const point = cap.at((Math.abs(v) - edge) / (1 - edge));
        const outward = v > 0 ? -1 : 1; // tampa de cima sobe, a de baixo desce
        pole = [
          Math.cos(theta) * point.rho,
          outward * (poleHalf + point.y),
          Math.sin(theta) * point.rho,
        ];
        poleColor = point.dome ? DOME_COLOR : RING_COLOR;
      } else {
        const h = v / edge; // -1..1 dentro do cilindro
        pole = [Math.cos(theta) * poleRadius, -h * poleHalf, Math.sin(theta) * poleRadius];
        const around = (((theta / (2 * Math.PI)) % 1) + 1) % 1;
        const stripe = Math.floor((around + ((h + 1) / 2) * turns) * repeats * 3) % 3;
        poleColor = STRIPE_COLORS[stripe];
      }

      const spread = radius * 3;
      const from: [number, number, number] = [
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
      ];
      particles.push({ from, globe, pole, poleColor });
    }
    return particles;
  }

  private shouldPlay(): boolean {
    if (typeof window === 'undefined' || window.location.pathname !== '/') return false;
    // Sem matchMedia (ex.: testes em jsdom) não há navegador de verdade para animar
    if (typeof window.matchMedia !== 'function') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (navigator.webdriver || /bot|crawler|spider|lighthouse/i.test(navigator.userAgent)) {
      return false;
    }
    try {
      return sessionStorage.getItem(SEEN_KEY) === null;
    } catch {
      return true;
    }
  }

  private rememberSeen(): void {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Sem sessionStorage (aba anônima restrita): a abertura pode tocar de novo, sem problema
    }
  }
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** easeInOutCubic */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Perfil da tampa do Barber Pole (raio × altura a partir da ponta do cilindro), que gira em
 * volta do eixo como uma peça torneada: uma aba saindo do cilindro, um anel arredondado mais
 * largo que ele e um domo fechando a ponta. `at(f)` devolve o ponto que fica na fração `f`
 * da área da superfície, para a densidade de pontos ficar uniforme (sem amontoar no domo).
 */
function buildCapProfile(
  poleRadius: number,
  unit: number,
): { area: number; at: (f: number) => CapPoint } {
  const ringOuter = unit * 0.6; // raio máximo do anel, mais largo que o cilindro
  const bead = unit * 0.12; // raio da curva do anel (metade da espessura dele)
  const domeBase = ringOuter - bead;
  const domeHeight = unit * 0.32;
  const steps = 48;
  const path: CapPoint[] = [];

  // Aba: do cilindro até a base do anel
  for (let k = 0; k <= steps; k++) {
    path.push({ rho: lerp(poleRadius, domeBase, k / steps), y: 0, dome: false });
  }
  // Anel arredondado: meia-volta para fora, de baixo para cima
  for (let k = 1; k <= steps; k++) {
    const angle = -Math.PI / 2 + (Math.PI * k) / steps;
    path.push({
      rho: domeBase + Math.cos(angle) * bead,
      y: bead + Math.sin(angle) * bead,
      dome: false,
    });
  }
  // Domo: quarto de elipse até a ponta, no eixo
  for (let k = 1; k <= steps; k++) {
    const angle = (Math.PI / 2) * (k / steps);
    path.push({
      rho: domeBase * Math.cos(angle),
      y: 2 * bead + domeHeight * Math.sin(angle),
      dome: true,
    });
  }

  // Área acumulada da superfície de revolução (cada trecho é um tronco de cone)
  const cumulative = [0];
  for (let k = 1; k < path.length; k++) {
    const a = path[k - 1];
    const b = path[k];
    const slant = Math.hypot(b.rho - a.rho, b.y - a.y);
    cumulative.push(cumulative[k - 1] + Math.PI * (a.rho + b.rho) * slant);
  }
  const area = cumulative[cumulative.length - 1];

  const at = (f: number): CapPoint => {
    const target = clamp(f) * area;
    let k = 1;
    while (k < cumulative.length - 1 && cumulative[k] < target) k++;
    const span = cumulative[k] - cumulative[k - 1] || 1;
    const t = (target - cumulative[k - 1]) / span;
    const a = path[k - 1];
    const b = path[k];
    return { rho: lerp(a.rho, b.rho, t), y: lerp(a.y, b.y, t), dome: b.dome };
  };

  return { area, at };
}
