export interface Book {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  año_publicacion: number;
  disponibilidad: boolean;
}

export interface CreateBookDto {
  titulo: string;
  autor: string;
  isbn: string;
  año_publicacion: number;
  disponibilidad?: boolean;
}

export interface UpdateBookDto {
  titulo?: string;
  autor?: string;
  isbn?: string;
  año_publicacion?: number;
  disponibilidad?: boolean;
}
