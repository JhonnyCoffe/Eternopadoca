const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = "public/uploads/fotos/";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg"));

async function resize() {
  for (const file of files) {
    const input = path.join(dir, file);
    const output = path.join(dir, "tmp_" + file);
    const buffer = await sharp(input)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    fs.writeFileSync(output, buffer);
    try { fs.unlinkSync(input); } catch {}
    fs.renameSync(output, input);
    console.log("Redimensionado:", file);
  }
}

resize();
