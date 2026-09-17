"use client";

import { useEffect } from "react";

/**
 * Trava a rolagem do app enquanto um modal / bottom sheet / overlay estiver
 * aberto.
 *
 * Antes cada overlay fazia `document.body.style.overflow = "hidden"` e
 * restaurava com `= ""`. Isso tinha dois problemas:
 *
 * 1. Com o app shell (documento nao rola, quem rola e `#app-scroll`), mexer no
 *    overflow do body nao trava mais nada.
 * 2. Overlays empilhados (ex.: NumPad aberto por cima do overlay de descanso)
 *    se atrapalhavam ao restaurar — o de fora restaurava "" e destravava a
 *    tela ainda com o de dentro aberto, ou pior, guardava "hidden" como valor
 *    anterior e deixava a pagina travada pra sempre.
 *
 * Aqui a trava e contada por referencia: so destrava quando o ultimo overlay
 * fecha. O CSS correspondente vive em globalStyles (`[data-scroll-locked]`).
 */
let lockCount = 0;

function applyLock() {
  document.body.dataset.scrollLocked = "true";
}

function releaseLock() {
  delete document.body.dataset.scrollLocked;
}

export function useScrollLock(active: boolean = true) {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    applyLock();

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) releaseLock();
    };
  }, [active]);
}

export default useScrollLock;
