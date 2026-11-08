import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStorageProvider } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { ok: false, error: "Faça login para enviar imagens." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Envio inválido." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Escolha uma imagem." },
      { status: 400 },
    );
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Formato não aceito. Use JPG, PNG, WebP, GIF ou AVIF." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "A imagem passa de 5 MB. Comprima e tente novamente." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const contentType = file.type;

  const storage = getStorageProvider();
  const result = await storage.upload(buffer, fileName, contentType);

  return NextResponse.json({
    ok: true,
    url: result.url,
    key: result.key,
    bytes: result.bytes,
  });
}
