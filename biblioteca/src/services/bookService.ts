import { axiosInstance } from '../api/axiosInstance';
import type { DeleteResponse } from '../types/api.types';
import type { Book, CreateBookDto, UpdateBookDto } from '../types/book.types';

const BOOKS_ENDPOINT = '/api/books';

export const bookService = {
  async getAll(): Promise<Book[]> {
    const response = await axiosInstance.get<Book[]>(BOOKS_ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Book> {
    const response = await axiosInstance.get<Book>(`${BOOKS_ENDPOINT}/${id}`);
    return response.data;
  },

  async create(payload: CreateBookDto): Promise<Book> {
    const response = await axiosInstance.post<Book>(BOOKS_ENDPOINT, payload);
    return response.data;
  },

  async update(id: number, payload: UpdateBookDto): Promise<Book> {
    const response = await axiosInstance.put<Book>(`${BOOKS_ENDPOINT}/${id}`, payload);
    return response.data;
  },

  async remove(id: number): Promise<DeleteResponse> {
    const response = await axiosInstance.delete<DeleteResponse>(`${BOOKS_ENDPOINT}/${id}`);
    return response.data;
  },
};
