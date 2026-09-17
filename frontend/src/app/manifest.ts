import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // `id` fixo evita que o navegador trate o app como uma instalacao nova
    // quando o start_url mudar no futuro.
    id: "/",
    name: "LoadUp",
    short_name: "LoadUp",
    description: "Seu app de treinos",
    start_url: "/home",
    // Sem `scope` o navegador infere a partir do start_url (/home), e qualquer
    // navegacao pra fora dele abriria no Safari em vez de ficar no app.
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Fundo real do app (theme.ts -> background: #020617). Antes estava
    // #0f172a, que e o `surface` — dava um flash de cor errada no launch.
    background_color: "#020617",
    theme_color: "#020617",
    categories: ["health", "fitness", "lifestyle"],
    lang: "pt-BR",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Com safe zone: o Android recorta o icone em circulo/squircle e sem
        // esta variante o logo sai cortado.
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
