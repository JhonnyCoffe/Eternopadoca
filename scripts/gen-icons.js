/**
 * Gera os ícones PNG do PWA sem dependências externas (usa só módulos nativos do Node).
 * Desenho: fundo vermelho/rose #e11d48 + hambúrguer minimalista em3 camadas.
 *
 * Uso: node scripts/gen-icons.js
 * Saída: public/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BG = [225, 29, 72]; // #e11d48
const BUN = [255, 255, 255];
const PATTY = [254, 205, 211]; // rose-200
const SS = 4; // supersampling (melhora as bordas)

/* --------------------------- PNG (sem dependências) --------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtro 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* --------------------------------- Desenho --------------------------------- */

// Retângulo arredondado com raios por canto (coordenadas do design 512)
function insideRoundedRect(x, y, x0, y0, w, h, tl, tr, br, bl) {
  if (x < x0 || y < y0 || x > x0 + w || y > y0 + h) return false;
  const right = x0 + w - x;
  const bottom = y0 + h - y;
  if (x - x0 < tl && y - y0 < tl) return (x - x0 - tl) ** 2 + (y - y0 - tl) ** 2 <= tl * tl;
  if (right < tr && y - y0 < tr) return (x - (x0 + w - tr)) ** 2 + (y - y0 - tr) ** 2 <= tr * tr;
  if (right < br && bottom < br) return (x - (x0 + w - br)) ** 2 + (y - (y0 + h - br)) ** 2 <= br * br;
  if (x - x0 < bl && bottom < bl) return (x - x0 - bl) ** 2 + (y - (y0 + h - bl)) ** 2 <= bl * bl;
  return true;
}

function insideEllipse(x, y, cx, cy, rx, ry) {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

/**
 * Renderiza um ícone.
 * @param {number} size lado do PNG final
 * @param {{ fullBleed?: boolean, scale?: number }} opts
 *   fullBleed: fundo cobre tudo (maskable / apple-touch); senão retângulo arredondado
 *   scale: escala do glifo do hambúrguer
 */
function renderIcon(size, opts = {}) {
  const { fullBleed = false, scale = 1 } = opts;
  const N = size * SS; // buffer em alta resolução
  // RGB já começa na cor do fundo para a média das bordas ficar limpa (sem halos pretos)
  const hi = Buffer.alloc(N * N * 4);
  for (let i = 0; i < N * N; i++) {
    hi[i * 4] = BG[0];
    hi[i * 4 + 1] = BG[1];
    hi[i * 4 + 2] = BG[2];
    hi[i * 4 + 3] = 0;
  }

  const set = (hx, hy, color, alpha = 255) => {
    const i = (hy * N + hx) * 4;
    hi[i] = color[0];
    hi[i + 1] = color[1];
    hi[i + 2] = color[2];
    hi[i + 3] = alpha;
  };

  // Preenche forma testando em coordenadas do design (0..512)
  const fill = (test, color) => {
    const min = 0;
    const max = 512;
    for (let hy = min * SS; hy < max * SS; hy++) {
      const dy = hy / SS;
      for (let hx = min * SS; hx < max * SS; hx++) {
        const dx = hx / SS;
        if (test(dx, dy)) set(hx, hy, color);
      }
    }
  };

  // Fundo
  if (fullBleed) {
    for (let i = 0; i < N * N; i++) hi[i * 4 + 3] = 255;
  } else {
    fill(
      (x, y) => insideRoundedRect(x, y, 0, 0, 512, 512, 112, 112, 112, 112),
      BG,
    );
  }

  // Glifo do hambúrguer centrado no canvas, com escala opcional
  const t = (v) => (v - 256) * scale + 256;
  const r = (v) => v * scale;

  const topBun = { x: t(120), y: t(158), w: r(272), h: r(76) };
  const patty = { x: t(136), y: t(248), w: r(240), h: r(38) };
  const bottomBun = { x: t(120), y: t(300), w: r(272), h: r(54) };

  fill(
    (x, y) =>
      insideRoundedRect(x, y, topBun.x, topBun.y, topBun.w, topBun.h, r(38), r(38), r(8), r(8)),
    BUN,
  );
  fill(
    (x, y) =>
      insideRoundedRect(x, y, patty.x, patty.y, patty.w, patty.h, r(19), r(19), r(19), r(19)),
    PATTY,
  );
  fill(
    (x, y) =>
      insideRoundedRect(x, y, bottomBun.x, bottomBun.y, bottomBun.w, bottomBun.h, r(8), r(8), r(27), r(27)),
    BUN,
  );

  // Gergelim (furos na cor do fundo, desenhados por cima do pão)
  const seeds = [
    [222, 190],
    [256, 184],
    [290, 190],
  ];
  for (const [cx, cy] of seeds) {
    fill((x, y) => insideEllipse(x, y, t(cx), t(cy), r(9), r(6)), BG);
  }

  // Downsample: média dos blocos SS×SS
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sr = 0, sg = 0, sb = 0, sa = 0;
      for (let oy = 0; oy < SS; oy++) {
        for (let ox = 0; ox < SS; ox++) {
          const i = ((y * SS + oy) * N + (x * SS + ox)) * 4;
          sr += hi[i];
          sg += hi[i + 1];
          sb += hi[i + 2];
          sa += hi[i + 3];
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 4;
      out[o] = Math.round(sr / n);
      out[o + 1] = Math.round(sg / n);
      out[o + 2] = Math.round(sb / n);
      out[o + 3] = Math.round(sa / n);
    }
  }
  return encodePng(size, size, out);
}

/* ---------------------------------- Main ----------------------------------- */

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const files = [
  ["icon-192.png", renderIcon(192, {})],
  ["icon-512.png", renderIcon(512, {})],
  ["maskable-512.png", renderIcon(512, { fullBleed: true, scale: 0.85 })],
  ["apple-touch-icon.png", renderIcon(180, { fullBleed: true, scale: 0.9 })],
];

for (const [name, buf] of files) {
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`ok ${name} (${buf.length} bytes)`);
}
