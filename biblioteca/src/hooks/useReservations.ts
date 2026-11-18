import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/axiosInstance';
import { reservationService } from '../services/reservationService';
import { mergeUsersWithReservations, userService } from '../services/userService';
import type { CreateReservationDto, Reservation } from '../types/reservation.types';
import type { User } from '../types/user.types';

export interface UseReservationsReturn {
  reservations: Reservation[];
  users: User[];
  loading: boolean;
  submitting: boolean;
  returningId: number | null;
  error: string | null;
  successMessage: string | null;
  fetchReservations: () => Promise<void>;
  createReservation: (payload: CreateReservationDto) => Promise<boolean>;
  returnReservation: (id: number) => Promise<boolean>;
  clearFeedback: () => void;
}

export function useReservations(
  onMutationSuccess?: () => Promise<void> | void
): UseReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [returningId, setReturningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onMutationSuccessRef = useRef(onMutationSuccess);

  useEffect(() => {
    onMutationSuccessRef.current = onMutationSuccess;
  }, [onMutationSuccess]);

  const clearFeedback = useCallback((): void => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const fetchReservations = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const [fetchedReservations, fetchedUsers] = await Promise.all([
        reservationService.getAll(),
        userService.getAll(),
      ]);
      setReservations(fetchedReservations);
      setUsers(mergeUsersWithReservations(fetchedUsers, fetchedReservations));
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(
    async (payload: CreateReservationDto): Promise<boolean> => {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const created = await reservationService.create(payload);
        setReservations((prev) => [created, ...prev]);
        setUsers((prev) => mergeUsersWithReservations(prev, [created]));
        setSuccessMessage(
          `Reserva #${created.id} para "${created.book.titulo}" registrada correctamente.`
        );
        await onMutationSuccessRef.current?.();
        return true;
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const returnReservation = useCallback(async (id: number): Promise<boolean> => {
    setReturningId(id);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await reservationService.returnBook(id);
      setReservations((prev) =>
        prev.map((reservation) => (reservation.id === id ? updated : reservation))
      );
      setSuccessMessage(
        `Devolución registrada: "${updated.book.titulo}" vuelve a estar disponible.`
      );
      await onMutationSuccessRef.current?.();
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setReturningId(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void Promise.all([reservationService.getAll(), userService.getAll()])
      .then(([fetchedReservations, fetchedUsers]) => {
        if (active) {
          setReservations(fetchedReservations);
          setUsers(mergeUsersWithReservations(fetchedUsers, fetchedReservations));
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
    reservations,
    users,
    loading,
    submitting,
    returningId,
    error,
    successMessage,
    fetchReservations,
    createReservation,
    returnReservation,
    clearFeedback,
  };
}
