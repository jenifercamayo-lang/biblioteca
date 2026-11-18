import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/axiosInstance';
import { bookService } from '../services/bookService';
import type { Book, CreateBookDto, UpdateBookDto } from '../types/book.types';

export interface UseBooksReturn {
  books: Book[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  successMessage: string | null;
  fetchBooks: () => Promise<void>;
  createBook: (payload: CreateBookDto) => Promise<boolean>;
  updateBook: (id: number, payload: UpdateBookDto) => Promise<boolean>;
  deleteBook: (id: number) => Promise<boolean>;
  clearFeedback: () => void;
}

export function useBooks(): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearFeedback = useCallback((): void => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const fetchBooks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await bookService.getAll();
      setBooks(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createBook = useCallback(async (payload: CreateBookDto): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const createdBook = await bookService.create(payload);
      setBooks((prev) => [...prev, createdBook].sort((a, b) => a.id - b.id));
      setSuccessMessage(`Libro "${createdBook.titulo}" registrado correctamente.`);
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateBook = useCallback(async (id: number, payload: UpdateBookDto): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedBook = await bookService.update(id, payload);
      setBooks((prev) => prev.map((book) => (book.id === id ? updatedBook : book)));
      setSuccessMessage(`Libro "${updatedBook.titulo}" actualizado correctamente.`);
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const deleteBook = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await bookService.remove(id);
      setBooks((prev) => prev.filter((book) => book.id !== id));
      setSuccessMessage(result.message || 'Libro eliminado correctamente.');
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void bookService
      .getAll()
      .then((data) => {
        if (active) {
          setBooks(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    books,
    loading,
    submitting,
    error,
    successMessage,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
    clearFeedback,
  };
}
