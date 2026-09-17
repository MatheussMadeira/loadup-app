/**
 * Gera os assets de PWA a partir de public/icons/icon-512.png:
 *
 *  - icon-180.png            apple-touch-icon no tamanho exato que o iOS usa
 *  - icon-maskable-512.png   icone com safe zone pro Android nao cortar o logo
 *  - splash/*.png            telas de launch do iOS (apple-touch-startup-image)
 *
 * Rode com `npm run gen:pwa` sempre que o icone base mudar.
 * A lista de resolucoes vive em src/lib/pwaSplashScreens.json — mesma fonte
 * que o layout usa pra montar as tags <link>, entao os dois nunca divergem.
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const SOURCE_ICON = path.join(PUBLIC, "icons", "icon-512.png");

const APPLE_SPLASH_SCREENS = JSON.parse(
  await readFile(path.join(ROOT, "src", "lib", "pwaSplashScreens.json"), "utf8"),
);

/** Fundo real do app no tema escuro (theme.ts -> background). */
const SPLASH_BG = "#020617";
/** O icone base ja e um quadrado preto full-bleed; o padding acompanha. */
const MASKABLE_BG = "#000000";

function roundedMask(size, radiusRatio) {
  const r = Math.round(size * radiusRatio);
  return Buffer.from(
    `<svg width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/>` +
      `</svg>`,
  );
}

async function generateAppleTouchIcon() {
  const out = path.join(PUBLIC, "icons", "icon-180.png");
  await sharp(SOURCE_ICON).resize(180, 180, { fit: "cover" }).png().toFile(out);
  return "icons/icon-180.png";
}

async function generateMaskableIcon() {
  // Safe zone do maskable: o conteudo precisa caber no circulo central de 80%.
  const size = 512;
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);

  const logo = await sharp(SOURCE_ICON).resize(inner, inner).toBuffer();
  const out = path.join(PUBLIC, "icons", "icon-maskable-512.png");

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: MASKABLE_BG,
    },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(out);

  return "icons/icon-maskable-512.png";
}

async function generateSplashScreens() {
  const dir = path.join(PUBLIC, "splash");
  await mkdir(dir, { recursive: true });

  const written = [];

  for (const screen of APPLE_SPLASH_SCREENS) {
    const { width, height, file } = screen;

    // Icone flutuando sobre o fundo do app, como um app nativo faz — o icone
    // de origem e um quadrado preto, entao usa-lo cru sobre #020617 deixaria
    // um retangulo visivel. Arredondar resolve.
    const logoSize = Math.round(Math.min(width, height) * 0.28);
    const logo = await sharp(SOURCE_ICON)
      .resize(logoSize, logoSize)
      .composite([
        { input: roundedMask(logoSize, 0.2237), blend: "dest-in" },
      ])
      .png()
      .toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: SPLASH_BG,
      },
    })
      .composite([
        {
          input: logo,
          top: Math.round((height - logoSize) / 2),
          left: Math.round((width - logoSize) / 2),
        },
      ])
      .png()
      .toFile(path.join(dir, file));

    written.push(`splash/${file}`);
  }

  return written;
}

const results = [
  await generateAppleTouchIcon(),
  await generateMaskableIcon(),
  ...(await generateSplashScreens()),
];

console.log(`Gerados ${results.length} arquivos:`);
for (const r of results) console.log("  public/" + r);
