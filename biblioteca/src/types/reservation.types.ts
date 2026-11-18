import type { Book } from './book.types';
import type { User } from './user.types';

export type ReservationStatus = 'ACTIVA' | 'DEVUELTA' | 'VENCIDA';

export interface Reservation {
  id: number;
  fecha_reserva: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real: string | null;
  estado: ReservationStatus;
  user: User;
  book: Book;
}

export interface CreateReservationDto {
  user_id: number;
  book_id: number;
  fecha_devolucion_esperada: string;
}
