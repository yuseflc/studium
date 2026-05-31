/* Archivo: src\lib\upload-limits.ts
	Descripción: Constantes y lógica para límites de subida de archivos (valor por defecto y fallback). */

// Límites de subida de archivos para entregas de tareas
// Exporta un valor seguro y una etiqueta legible para UI
const taskSubmissionMaxFileSizeBytes = Number(
	process.env.NEXT_PUBLIC_TASK_SUBMISSION_MAX_FILE_SIZE_BYTES
);

if (!Number.isFinite(taskSubmissionMaxFileSizeBytes) || taskSubmissionMaxFileSizeBytes <= 0) {
	throw new Error(
		"NEXT_PUBLIC_TASK_SUBMISSION_MAX_FILE_SIZE_BYTES debe ser un número positivo"
	);
}

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