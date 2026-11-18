import { AppDataSource } from '../config/database.js';
import { BookModel } from '../models/book.model.js';
import { UserModel } from '../models/user.model.js';
import { ReservationModel, ReservationStatus } from '../models/reservation.model.js';

const getReservationRepository = () => AppDataSource.getRepository(ReservationModel);

/**
 * Error controlado para abortar transacciones de negocio con su código HTTP correspondiente.
 */
class DomainError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Valida y convierte un identificador a entero positivo.
 */
const parsePositiveInt = (rawValue) => {
  const parsed = Number(rawValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Valida y convierte una fecha en cadena/timestamp a instancia Date válida.
 */
const parseValidDate = (rawDate) => {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Centraliza la respuesta de errores esperados y fallos inesperados del controlador.
 */
const handleControllerError = (res, error, context) => {
  if (error instanceof DomainError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(`[ReservationController:${context}]`, error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
};

/**
 * GET /api/reservations - Lista todas las reservas con su usuario y libro asociados.
 */
export const getAllReservations = async (_req, res) => {
  try {
    const reservations = await getReservationRepository().find({
      relations: {
        user: true,
        book: true,
      },
      order: { id: 'DESC' },
    });
    return res.status(200).json(reservations);
  } catch (error) {
    return handleControllerError(res, error, 'getAllReservations');
  }
};

/**
 * GET /api/reservations/:id - Obtiene el detalle de una reserva por su ID.
 */
export const getReservationById = async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'El ID de la reserva no es válido.' });
  }

  try {
    const reservation = await getReservationRepository().findOne({
      where: { id },
      relations: {
        user: true,
        book: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    return handleControllerError(res, error, 'getReservationById');
  }
};

/**
 * POST /api/reservations - Crea una reserva validando disponibilidad y actualizando el libro.
 */
export const createReservation = async (req, res) => {
  const body = req.body ?? {};
  const userId = parsePositiveInt(body.user_id ?? body.userId);
  const bookId = parsePositiveInt(body.book_id ?? body.bookId);
  const expectedReturnDate = parseValidDate(body.fecha_devolucion_esperada);

  if (!userId || !bookId || !expectedReturnDate) {
    return res.status(400).json({
      message:
        'Los campos "user_id", "book_id" (enteros positivos) y "fecha_devolucion_esperada" (fecha válida) son obligatorios.',
    });
  }

  try {
    const createdReservation = await AppDataSource.transaction(async (manager) => {
      const user = await manager.findOneBy(UserModel, { id: userId });
      if (!user) {
        throw new DomainError(404, 'Usuario no encontrado.');
      }

      // Bloqueo pesimista sobre el libro para evitar reservas simultáneas del mismo ejemplar.
      const book = await manager.findOne(BookModel, {
        where: { id: bookId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!book) {
        throw new DomainError(404, 'Libro no encontrado.');
      }

      if (!book.disponibilidad) {
        throw new DomainError(409, 'El libro no está disponible para reserva.');
      }

      book.disponibilidad = false;
      await manager.save(BookModel, book);

      const reservationRepo = manager.getRepository(ReservationModel);
      const reservation = reservationRepo.create({
        user,
        book,
        fecha_reserva: new Date(),
        fecha_devolucion_esperada: expectedReturnDate,
        fecha_devolucion_real: null,
        estado: ReservationStatus.ACTIVA,
      });

      return reservationRepo.save(reservation);
    });

    return res.status(201).json(createdReservation);
  } catch (error) {
    return handleControllerError(res, error, 'createReservation');
  }
};

/**
 * PATCH /api/reservations/:id/return - Registra la devolución del libro y restaura su disponibilidad.
 */
export const returnBook = async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'El ID de la reserva no es válido.' });
  }

  try {
    const updatedReservation = await AppDataSource.transaction(async (manager) => {
      const reservationRepo = manager.getRepository(ReservationModel);
      const reservation = await reservationRepo.findOne({
        where: { id },
        relations: {
          user: true,
          book: true,
        },
      });

      if (!reservation) {
        throw new DomainError(404, 'Reserva no encontrada.');
      }

      if (reservation.estado === ReservationStatus.DEVUELTA) {
        throw new DomainError(400, 'Esta reserva ya fue devuelta anteriormente.');
      }

      reservation.fecha_devolucion_real = new Date();
      reservation.estado = ReservationStatus.DEVUELTA;
      reservation.book.disponibilidad = true;

      await manager.save(BookModel, reservation.book);
      return reservationRepo.save(reservation);
    });

    return res.status(200).json(updatedReservation);
  } catch (error) {
    return handleControllerError(res, error, 'returnBook');
  }
};
