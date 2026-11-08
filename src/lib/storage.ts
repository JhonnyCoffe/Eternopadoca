import { promises as fs } from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";

export type StorageResult = {
  url: string;
  key: string;
  bytes: number;
};

export interface StorageProvider {
  upload(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<StorageResult>;
}

/* ------------------------------------------------------------------ */
/*  DiskStorageProvider — gravador local (fallback / desenvolvimento) */
/* ------------------------------------------------------------------ */

export class DiskStorageProvider implements StorageProvider {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    this.baseUrl = "/uploads";
  }

  async upload(buffer: Buffer, key: string, contentType: string) {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, key);
    await fs.writeFile(filePath, buffer);
    return {
      url: `${this.baseUrl}/${key}`,
      key,
      bytes: buffer.length,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  S3StorageProvider — AWS S3 / Cloudflare R2 (produção serverless)  */
/* ------------------------------------------------------------------ */

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT; // ex: https://<account>.r2.cloudflarestorage.com
    const region = process.env.S3_REGION || "auto";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    this.bucket = process.env.S3_BUCKET!;
    this.publicUrl = process.env.S3_PUBLIC_URL!; // ex: https://cdn.seudominio.com.br

    if (!accessKeyId || !secretAccessKey || !this.bucket || !this.publicUrl) {
      throw new Error(
        "S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET e S3_PUBLIC_URL são obrigatórios.",
      );
    }

    const config: S3ClientConfig = {
      region,
      credentials: { accessKeyId, secretAccessKey },
    };
    if (endpoint) config.endpoint = endpoint;
    if (endpoint?.includes("r2.cloudflarestorage.com")) {
      config.forcePathStyle = true;
    }

    this.client = new S3Client(config);
  }

  async upload(buffer: Buffer, key: string, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return {
      url: `${this.publicUrl}/${key}`,
      key,
      bytes: buffer.length,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Seleção do provedor                                               */
/* ------------------------------------------------------------------ */

let providerCache: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (providerCache) return providerCache;

  const useS3 =
    !!process.env.S3_ACCESS_KEY_ID &&
    !!process.env.S3_SECRET_ACCESS_KEY &&
    !!process.env.S3_BUCKET &&
    !!process.env.S3_PUBLIC_URL;

  providerCache = useS3 ? new S3StorageProvider() : new DiskStorageProvider();
  return providerCache;
}

export function isS3Enabled(): boolean {
  return (
    !!process.env.S3_ACCESS_KEY_ID &&
    !!process.env.S3_SECRET_ACCESS_KEY &&
    !!process.env.S3_BUCKET &&
    !!process.env.S3_PUBLIC_URL
  );
}
