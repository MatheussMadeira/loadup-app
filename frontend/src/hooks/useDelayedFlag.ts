"use client";

import { useEffect, useState } from "react";

/**
 * Espelha uma flag, mas so liga depois de `delayMs` — e desliga na hora.
 *
 * Serve pra feedback de carregamento que normalmente resolve rapido demais pra
 * valer a pena mostrar: sem o atraso, o spinner aparece por um frame so e o
 * resultado e um piscado, que incomoda mais do que ajuda. Com o atraso, ele so
 * aparece quando a espera e real (rede ruim).
 */
export function useDelayedFlag(active: boolean, delayMs = 150): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    const timeout = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timeout);
  }, [active, delayMs]);

  return visible;
}

export default useDelayedFlag;
