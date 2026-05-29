import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Sube un archivo a Cloudflare R2
 * @param file Archivo en formato Buffer o Uint8Array
 * @param fileName Nombre único para el archivo (ej: `submissions/${taskId}/${userId}-${Date.now()}.pdf`)
 * @param contentType Tipo de contenido (ej: `application/pdf`)
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  });

  try {
    await r2Client.send(command);
    
    // Si tienes un dominio personalizado o el dominio .r2.dev configurado, 
    // asegúrate de ponerlo en NEXT_PUBLIC_R2_PUBLIC_URL
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    
    // Si no hay baseUrl, retornamos solo la key (el path) para que el desarrollador sepa qué se guardó
    return baseUrl ? `${baseUrl}/${fileName}` : fileName;
  } catch (error) {
    console.error("Error al subir a R2:", error);
    throw new Error("No se pudo subir el archivo a R2");
  }
}
