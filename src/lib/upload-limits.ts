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