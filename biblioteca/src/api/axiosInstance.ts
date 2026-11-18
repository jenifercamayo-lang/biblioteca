import axios, { type AxiosError, type AxiosResponse } from 'axios';
import {
  isApiErrorResponse,
  isApiNormalizedError,
  type ApiNormalizedError,
} from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export function normalizeAxiosError(error: AxiosError<unknown>): ApiNormalizedError {
  const status = error.response?.status ?? 0;
  const responseData = error.response?.data;

  if (isApiErrorResponse(responseData)) {
    const details = responseData.errors ?? [];
    const combinedMessage =
      details.length > 0 ? `${responseData.message} ${details.join(' ')}` : responseData.message;

    return {
      status,
      message: combinedMessage,
      errors: details,
    };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      status,
      message: 'La solicitud tardó demasiado tiempo en responder.',
      errors: [],
    };
  }

  if (!error.response) {
    return {
      status: 0,
      message: 'No se pudo conectar con el servidor de la biblioteca.',
      errors: [],
    };
  }

  return {
    status,
    message: error.message || 'Ocurrió un error inesperado en la comunicación con el servidor.',
    errors: [],
  };
}

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<unknown>): Promise<never> => {
    const normalized = normalizeAxiosError(error);
    error.message = normalized.message;
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (isApiNormalizedError(error)) {
    return error.errors.length > 0
      ? `${error.message} ${error.errors.join(' ')}`
      : error.message;
  }

  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error).message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado.';
}

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
