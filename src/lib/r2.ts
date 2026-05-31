import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

let cachedR2Client: S3Client | null = null;

function getR2Config(): R2Config {
  const endpoint = process.env.R2_S3_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  const missing: string[] = [];
  if (!endpoint) missing.push("R2_S3_ENDPOINT");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!bucketName) missing.push("R2_BUCKET_NAME");

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno de R2: ${missing.join(", ")}`);
  }

  return { endpoint, accessKeyId, secretAccessKey, bucketName };
}

function getR2Client(config: R2Config): S3Client {
  if (cachedR2Client) return cachedR2Client;

  cachedR2Client = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedR2Client;
}

/**
 * Sube un archivo a Cloudflare R2
 * @param file Archivo en formato Buffer o Uint8Array
 * @param fileName Nombre único para el archivo (ej: `resources/${courseId}/${unitId}/${timestamp}-name.pdf`)
 * @param contentType Tipo de contenido MIME (ej: `application/pdf`)
 * @returns URL pública del archivo o la clave si no hay dominio configurado
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string
) {
  const config = getR2Config();
  const r2Client = getR2Client(config);

  // Crear comando de PutObject para R2
  // Key es la ruta del archivo dentro del bucket (similar a un path de filesystem)
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  });

  try {
    // Enviar el comando al cliente S3 (que está configurado para R2)
    await r2Client.send(command);
    
    // NEXT_PUBLIC_R2_PUBLIC_URL debe ser:
    // - Para dominio R2 estándar: https://tu-bucket.r2.dev
    // - Para dominio personalizado: https://tu-dominio.com
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    
    // Construir y retornar la URL pública del archivo
    // Ejemplo: https://tu-bucket.r2.dev/resources/courseId/unitId/123456-documento.pdf
    return baseUrl ? `${baseUrl}/${fileName}` : fileName;
  } catch (error) {
    // Loguear el error específico para debugging
    console.error("Error al subir a R2:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`No se pudo subir el archivo a R2: ${message}`);
  }
}
