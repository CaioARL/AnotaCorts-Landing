import { Component, DestroyRef, inject, signal } from '@angular/core';

interface IntroCell {
  /** Atraso do quadrado branco; null nas casas que ficam só com o degradê. */
  delay: string | null;
}

const SEEN_KEY = 'anotacorts-intro-seen';
/**
 * Tamanho do xadrez em cada canto (superior esquerdo e inferior direito), em diagonais a partir
 * da ponta. As diagonais alternam branco e azul (o degradê): 0 = um quadrado branco só,
 * 2 = 1 + 3 brancos, 4 = 1 + 3 + 5 brancos. Use números pares para terminar num branco.
 */
const CORNER_DEPTH = 4;
/** Tempo em que só o degradê azul aparece, antes do primeiro quadrado. */
const START_MS = 300;
/** Intervalo entre um quadrado branco e o próximo (eles carregam um por um). */
const STEP_MS = 90;
/** Duração do surgimento de cada quadrado. */
const SQUARE_MS = 600;
/** Tempo com os quadrados parados antes de a abertura sumir. */
const HOLD_MS = 350;
/** Quantos quadrados brancos cada canto tem: 1 + 3 + 5... até a última diagonal branca. */
const WHITES_PER_CORNER = (Math.floor(CORNER_DEPTH / 2) + 1) ** 2;
const FADE_START_MS = START_MS + (WHITES_PER_CORNER - 1) * STEP_MS + SQUARE_MS + HOLD_MS;

/**
 * Abertura do site: tela no degradê azul, quadrados brancos carregam um por um nos cantos superior
 * esquerdo e inferior direito, e a camada some revelando a home. Toca só ao abrir a home,
 * uma vez por sessão, e nunca para quem pediu menos movimento ou para robôs de busca.
 */
@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.css',
})
export class Intro {
  readonly visible = signal(false);
  readonly squareMs = `${SQUARE_MS}ms`;
  readonly fadeDelay = `${FADE_START_MS}ms`;
  cols = 0;
  rows = 0;
  cells: IntroCell[] = [];

  constructor() {
    if (!this.shouldPlay()) return;

    const size = window.innerWidth < 640 ? 64 : 90;
    this.cols = Math.ceil(window.innerWidth / size);
    this.rows = Math.ceil(window.innerHeight / size);
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // Distância em diagonal até o canto mais próximo entre os dois de origem
        const fromTopLeft = row + col;
        const fromBottomRight = this.rows - 1 - row + (this.cols - 1 - col);
        const nearTopLeft = fromTopLeft <= fromBottomRight;
        const distance = nearTopLeft ? fromTopLeft : fromBottomRight;
        // Xadrez: diagonais pares ficam brancas, as ímpares mostram o azul do degradê
        const white = distance <= CORNER_DEPTH && distance % 2 === 0;
        if (!white) {
          this.cells.push({ delay: null });
          continue;
        }
        // Ordem de carregamento, um por um: diagonal por diagonal a partir da ponta e, dentro
        // da diagonal, a partir da borda de cima (ou de baixo, no canto inferior direito).
        // As diagonais brancas anteriores somam (distance / 2)² quadrados.
        const rowInCorner = nearTopLeft ? row : this.rows - 1 - row;
        const order = (distance / 2) ** 2 + rowInCorner;
        this.cells.push({ delay: `${START_MS + order * STEP_MS}ms` });
      }
    }

    this.visible.set(true);
    this.rememberSeen();
    // Trava a rolagem da página enquanto a abertura cobre a tela
    document.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => (document.body.style.overflow = ''));
  }

  /** Remove a camada quando a animação de saída termina (ignora as animações dos quadrados). */
  onAnimationEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget) return;
    this.visible.set(false);
    document.body.style.overflow = '';
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
