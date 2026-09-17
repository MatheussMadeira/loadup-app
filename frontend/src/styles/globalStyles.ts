import { createGlobalStyle } from "styled-components";

const hexToRgb = (value: string) => {
  const hex = value.trim().replace("#", "");
  if (![3, 6].includes(hex.length)) return value;
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
};

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    color-scheme: ${({ theme }) => theme.mode};
    --c-primary: ${({ theme }) => theme.colors.primary};
    --c-primary-rgb: ${({ theme }) => hexToRgb(theme.colors.primary)};
    --c-primary-dark: ${({ theme }) => theme.colors.primaryDark};
    --c-primary-dark-rgb: ${({ theme }) => hexToRgb(theme.colors.primaryDark)};
    --c-surface: ${({ theme }) => theme.colors.surface};
    --c-surface-rgb: ${({ theme }) => hexToRgb(theme.colors.surface)};
    --c-surface-elevated: ${({ theme }) => theme.colors.surfaceElevated};
    --c-surface-elevated-rgb: ${({ theme }) => hexToRgb(theme.colors.surfaceElevated)};
    --c-bg: ${({ theme }) => theme.colors.background};
    --c-bg-rgb: ${({ theme }) => hexToRgb(theme.colors.background)};
    --c-text: ${({ theme }) => theme.colors.onBackground};
    --c-text-muted: ${({ theme }) => theme.colors.onBackgroundMuted};
    --c-success: ${({ theme }) => theme.colors.success};
    --c-warning: ${({ theme }) => theme.colors.warning};
    --c-destructive: ${({ theme }) => theme.colors.destructive};
    --c-border: ${({ theme }) => theme.colors.outline};
    --c-border-rgb: ${({ theme }) => hexToRgb(theme.colors.outline)};
    --c-border-alpha: ${({ theme }) => theme.colors.borderAlpha};

    /* ── App chrome (PWA) ────────────────────────────────────────────────
       Fonte unica de verdade para a altura da barra inferior e para o
       "piso" de qualquer elemento flutuante. Antes cada tela chutava um
       numero magico (65px, 80px, 88px, 96px, 12%...) e nenhum deles
       considerava o safe-area do iPhone, por isso os botoes ficavam
       parcialmente cobertos pela navegacao. */
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --bottom-nav-content-height: 62px;
    --bottom-nav-height: calc(
      var(--bottom-nav-content-height) + var(--safe-bottom)
    );
    --floating-gap: 12px;
    /* Piso para FABs / widgets / barras de acao das telas. */
    --fab-bottom: calc(var(--bottom-nav-height) + var(--floating-gap));
  }

  /* ── App shell ──────────────────────────────────────────────────────────
     O documento nunca rola: quem rola e o container interno (#app-scroll).
     No iOS (Safari/PWA standalone) o scroll do documento e o que provoca o
     descolamento de elementos position:fixed — rubber-band, offset entre
     layout viewport e visual viewport e o status bar translucido deslocam a
     camada composta da barra inferior, que "gruda" no meio da tela ate o
     proximo repaint. Sem scroll no documento, position:fixed fica estavel. */
  html,
  body {
    height: 100%;
    max-height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
  }

  html {
    font-size: 16px;
    /* Evita o iOS inflar fontes ao girar a tela. */
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    /* Sem o flash cinza de toque ao tocar em links/botoes no iOS. */
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: var(--font-barlow-regular), sans-serif;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.onBackground};
    background-color: ${({ theme }) => theme.colors.background};
    position: relative;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* Trava de rolagem usada por modais e bottom sheets (ver useScrollLock). */
  body[data-scroll-locked="true"] #app-scroll {
    overflow: hidden !important;
    touch-action: none;
  }
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
}
  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  a,
  [role="button"] {
    /* Mata o atraso de ~300ms do duplo-toque no WebKit. */
    touch-action: manipulation;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input,
  textarea {
    font-family: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  .font-display {
    font-family: var(--font-bebas), Impact, sans-serif;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .font-headline {
    font-family: var(--font-barlow), Inter, sans-serif;
    font-weight: 900;
    letter-spacing: -0.01em;
  }

  .font-label {
    font-family: var(--font-barlow), Inter, sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .font-condensed {
    font-family: var(--font-barlow), Inter, sans-serif;
    font-weight: 400;
  }

  .glass {
    background: ${({ theme }) => theme.colors.glassOverlay};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .glass-strong {
    background: ${({ theme }) => theme.colors.glassOverlay};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .border-line {
    border-color: ${({ theme }) => theme.colors.outline};
  }

  .bg-primary {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  .bg-primary-soft {
    background-color: ${({ theme }) => theme.colors.primaryContainer};
  }

  .bg-surface {
    background-color: ${({ theme }) => theme.colors.surface};
  }

  .bg-surface-elevated {
    background-color: ${({ theme }) => theme.colors.surfaceElevated};
  }

  .text-primary {
    color: ${({ theme }) => theme.colors.primary};
  }

  .text-ink {
    color: ${({ theme }) => theme.colors.onBackground};
  }

  .text-ink-muted {
    color: ${({ theme }) => theme.colors.onBackgroundMuted};
  }

  .rounded-card {
    border-radius: ${({ theme }) => theme.borderRadius.card};
  }

  .text-balance {
    text-wrap: balance;
  }
`;
