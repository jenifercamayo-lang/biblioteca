export interface ApiErrorResponse {
  message: string;
  errors?: string[];
}

export interface ApiNormalizedError {
  status: number;
  message: string;
  errors: string[];
}

export interface DeleteResponse {
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (!isRecord(data)) {
    return false;
  }

  if (typeof data.message !== 'string') {
    return false;
  }

  if (data.errors !== undefined) {
    if (!Array.isArray(data.errors)) {
      return false;
    }

    return data.errors.every((item): item is string => typeof item === 'string');
  }

  return true;
}

export function isApiNormalizedError(error: unknown): error is ApiNormalizedError {
  if (!isRecord(error)) {
    return false;
  }

  return (
    typeof error.status === 'number' &&
    typeof error.message === 'string' &&
    Array.isArray(error.errors) &&
    error.errors.every((item): item is string => typeof item === 'string')
  );
}
