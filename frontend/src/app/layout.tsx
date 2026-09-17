import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Barlow_Condensed, Inter } from "next/font/google";
import { Barlow } from "next/font/google";

import StyledComponentsRegistry from "@/lib/registry";
import splashScreens from "@/lib/pwaSplashScreens.json";
import Providers from "./providers";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
});

const barlow = Barlow({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-regular",
});
const inter = Inter({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LoadUp",
  description: "Seu app de treinos",
  icons: {
    icon: "/icons/icon-512.png",
    // 180x180 e o tamanho exato que o iOS usa no icone da tela de inicio.
    apple: "/icons/icon-180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LoadUp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  // Fundo real do app (theme.ts -> background). #0f172a era o `surface`.
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Telas de launch do iOS. Sem elas o app abre com um flash branco
            antes do primeiro paint — o iOS nao usa o background_color do
            manifest, so estas imagens. As resolucoes vivem em
            src/lib/pwaSplashScreens.json, mesma fonte do script que as gera
            (npm run gen:pwa). */}
        {splashScreens.map((screen) => (
          <link
            key={screen.file}
            rel="apple-touch-startup-image"
            href={`/splash/${screen.file}`}
            media={
              `(device-width: ${screen.ptWidth}px) and ` +
              `(device-height: ${screen.ptHeight}px) and ` +
              `(-webkit-device-pixel-ratio: ${screen.dpr}) and ` +
              `(orientation: portrait)`
            }
          />
        ))}
      </head>
      <body
        className={`${bebasNeue.variable} ${barlowCondensed.variable} ${inter.variable} ${barlow.variable}`}
      >
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
