import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

/**
 * Assina o push para o alerta de fim de descanso.
 *
 * Depende de um service worker ja registrado (useServiceWorker) — e o guard
 * de `PushManager` aqui vale so pro push, nao mais pro registro do worker.
 * No iOS `PushManager` so existe com o app instalado na tela de inicio.
 */
export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!("Notification" in window)) return;

    async function setup() {
      try {
        // O registro em si e responsabilidade do useServiceWorker (roda na
        // raiz, pra todas as rotas). Aqui so esperamos ele ficar ativo.
        const reg = await navigator.serviceWorker.ready;

        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
        if (Notification.permission !== "granted") return;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        const existing = await reg.pushManager.getSubscription();
        const sub =
          existing ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
          }));
        setSubscription(sub);
      } catch (err) {
        console.warn("Push setup failed:", err);
      }
    }

    void setup();
  }, []);

  return subscription;
}
