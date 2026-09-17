"use client";

import { useEffect } from "react";

/**
 * Registra o service worker do app.
 *
 * Isso vive separado de usePushNotifications de proposito. Antes o registro
 * acontecia dentro do fluxo de push, atras de dois portoes:
 *
 *   if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
 *
 * `PushManager` so existe no iOS quando o app ja esta instalado na tela de
 * inicio (16.4+), e o hook so era montado dentro do layout autenticado. Ou
 * seja: no Safari comum, na tela de login, e em qualquer browser sem Push API,
 * o service worker simplesmente nunca era registrado — o que tornaria offline
 * impossivel de implementar depois, independente do resto.
 *
 * Agora o registro depende so de o browser suportar service worker, e roda na
 * raiz da arvore (Providers), valendo pra todas as rotas. Push continua sendo
 * um consumidor opcional desse registro.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        // Sem isso o proprio sw.js pode ser servido do cache HTTP e o app
        // ficar preso numa versao antiga do worker depois de um deploy.
        updateViaCache: "none",
      })
      .catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
  }, []);
}

export default useServiceWorker;
