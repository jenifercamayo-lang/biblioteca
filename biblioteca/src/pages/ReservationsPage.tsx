import { useMemo, useState } from 'react';
import { Alert, Button, Typography } from '@material-tailwind/react';
import { ReservationModal } from '../components/ReservationModal';
import { ReservationTable } from '../components/ReservationTable';
import { useReservations } from '../hooks/useReservations';
import type { Book } from '../types/book.types';
import type { Reservation, ReservationStatus } from '../types/reservation.types';

export interface ReservationsPageProps {
  books: Book[];
  onBooksRefresh: () => Promise<void>;
}

type StatusFilter = 'TODAS' | ReservationStatus;

const STATUS_FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'ACTIVA', label: 'Activas' },
  { value: 'VENCIDA', label: 'Vencidas' },
  { value: 'DEVUELTA', label: 'Devueltas' },
];

export function ReservationsPage({ books, onBooksRefresh }: ReservationsPageProps) {
  const {
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
  } = useReservations(onBooksRefresh);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODAS');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const availableBooks = useMemo(
    (): Book[] => books.filter((book) => book.disponibilidad),
    [books]
  );

  const filteredReservations = useMemo((): Reservation[] => {
    if (statusFilter === 'TODAS') {
      return reservations;
    }

    return reservations.filter((reservation) => reservation.estado === statusFilter);
  }, [reservations, statusFilter]);

  const handleOpenCreateModal = (): void => {
    clearFeedback();
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const handleRefreshAll = async (): Promise<void> => {
    await Promise.all([fetchReservations(), onBooksRefresh()]);
  };

  const handleReturnBook = (reservation: Reservation): void => {
    void returnReservation(reservation.id);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h4" color="blue-gray">
            Módulo de Reservas
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            Registra préstamos para libros disponibles ({availableBooks.length} disponibles) y
            gestiona devoluciones.
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outlined"
            color="blue-gray"
            size="sm"
            type="button"
            onClick={() => {
              void handleRefreshAll();
            }}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="sm"
            type="button"
            onClick={handleOpenCreateModal}
          >
            + Nueva Reserva
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert color="green" variant="ghost" open={Boolean(successMessage)} onClose={clearFeedback}>
          {successMessage}
        </Alert>
      )}

      {error && !isModalOpen && (
        <Alert color="red" variant="ghost" open={Boolean(error)} onClose={clearFeedback}>
          {error}
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filterOption) => (
          <Button
            key={filterOption.value}
            size="sm"
            variant={statusFilter === filterOption.value ? 'filled' : 'outlined'}
            color={statusFilter === filterOption.value ? 'blue' : 'blue-gray'}
            type="button"
            onClick={() => setStatusFilter(filterOption.value)}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      <ReservationTable
        reservations={filteredReservations}
        loading={loading}
        returningId={returningId}
        onReturnBook={handleReturnBook}
      />

      <ReservationModal
        open={isModalOpen}
        availableBooks={availableBooks}
        users={users}
        submitting={submitting}
        error={error}
        onClose={handleCloseModal}
        onSubmit={createReservation}
      />
    </section>
  );
}
