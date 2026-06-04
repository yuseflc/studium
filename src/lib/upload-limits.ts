/* Archivo: src\lib\upload-limits.ts
	Descripción: Constantes y lógica para límites de subida de archivos (valor por defecto y fallback). */

// Límites de subida de archivos para entregas de tareas
// Exporta un valor seguro y una etiqueta legible para UI
// Fallback a 100 MB si la variable de entorno no está definida (ej. en el build de Cloudflare).
const _parsed = Number(process.env.NEXT_PUBLIC_TASK_SUBMISSION_MAX_FILE_SIZE_BYTES);
const taskSubmissionMaxFileSizeBytes =
	Number.isFinite(_parsed) && _parsed > 0 ? _parsed : 104857600;

function formatFileSize(bytes: number): string {
	if (bytes % (1024 * 1024) === 0) {
		return `${bytes / (1024 * 1024)} MB`;
	}

	if (bytes % 1024 === 0) {
		return `${bytes / 1024} KB`;
	}

	return `${bytes} B`;
}

export const TASK_SUBMISSION_MAX_FILE_SIZE_BYTES = taskSubmissionMaxFileSizeBytes;
export const TASK_SUBMISSION_MAX_FILE_SIZE_LABEL = formatFileSize(taskSubmissionMaxFileSizeBytes);