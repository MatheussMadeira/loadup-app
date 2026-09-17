import { keyframes } from "styled-components";

/**
 * Page-level enter: fade-in.
 *
 * NAO adicione transform/translate/scale/filter aqui. Esta animacao roda com
 * fill-mode `both` num wrapper que envolve a pagina inteira, entao o valor do
 * ultimo keyframe fica retido: um `transform: translateY(0)` continua sendo um
 * transform, e qualquer transform faz o elemento virar containing block dos
 * descendentes `position: fixed`.
 *
 * Na pratica isso quebrava as barras de acao fixas que vivem dentro das
 * paginas (StyledEditBar, StyledFab, StyledStartBtn do plano de treino) e os
 * modais full-screen: em vez de se ancorarem no viewport, eles se ancoravam na
 * caixa do conteudo — que e mais alta que a tela. Resultado: ao rolar, a barra
 * "descolava" e ficava parada no meio da tela cobrindo o conteudo.
 *
 * Se algum dia quisermos o slide de volta, ele tem que ser aplicado num
 * elemento que comprovadamente nao tenha descendentes `position: fixed`.
 */
export const pageEnter = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Auth tab enter: fade-in + slide in from 8px to the right.
 * Used by (auth)/layout.tsx keyed by pathname.
 */
export const tabEnter = keyframes`
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

/**
 * Modal content enter: fade-in + scale from 0.95 to 1.
 * Used by the Modal base component content card.
 */
export const modalEnter = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Modal overlay enter: fade-in backdrop.
 * Used by the Modal base component fixed overlay.
 */
export const modalOverlay = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/** Transition config for page-level transitions. */
export const PAGE_TRANSITION = {
  duration: "300ms",
  easing: "ease",
} as const;

/** Transition config for auth tab switches. */
export const TAB_TRANSITION = {
  duration: "200ms",
  easing: "ease-out",
} as const;

/** Transition config for modal enter/exit. */
export const MODAL_TRANSITION = {
  duration: "200ms",
  easing: "ease-out",
  overlayDuration: "150ms",
  overlayEasing: "linear",
} as const;
