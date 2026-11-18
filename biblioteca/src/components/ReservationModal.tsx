import type React from 'react';
import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Spinner,
  Typography,
} from '@material-tailwind/react';
import type { Book } from '../types/book.types';
import type { CreateReservationDto } from '../types/reservation.types';
import type { User } from '../types/user.types';

export interface ReservationModalProps {
  open: boolean;
  availableBooks: Book[];
  users: User[];
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateReservationDto) => Promise<boolean>;
}

interface ReservationFormContentProps {
  availableBooks: Book[];
  users: User[];
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateReservationDto) => Promise<boolean>;
}

function getDefaultExpectedReturnDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 0, 0);

  const pad = (value: number): string => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function ReservationFormContent({
  availableBooks,
  users,
  submitting,
  error,
  onClose,
  onSubmit,
}: ReservationFormContentProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>(() =>
    availableBooks[0] ? String(availableBooks[0].id) : ''
  );
  const [selectedUserId, setSelectedUserId] = useState<string>(() =>
    users[0] ? String(users[0].id) : ''
  );
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(() =>
    getDefaultExpectedReturnDate()
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const effectiveBookId =
    selectedBookId && availableBooks.some((book) => String(book.id) === selectedBookId)
      ? selectedBookId
      : availableBooks[0]
        ? String(availableBooks[0].id)
        : '';

  const effectiveUserId = selectedUserId || (users[0] ? String(users[0].id) : '');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setValidationError(null);

    const parsedBookId = Number(effectiveBookId);
    const parsedUserId = Number(effectiveUserId);

    if (!Number.isInteger(parsedBookId) || parsedBookId <= 0) {
      setValidationError('Debes seleccionar un libro disponible.');
      return;
    }

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setValidationError('Debes seleccionar o indicar un ID de usuario válido (entero positivo).');
      return;
    }

    if (!expectedReturnDate.trim()) {
      setValidationError('La fecha de devolución esperada es obligatoria.');
      return;
    }

    const parsedDate = new Date(expectedReturnDate);
    if (Number.isNaN(parsedDate.getTime())) {
      setValidationError('La fecha de devolución esperada no tiene un formato válido.');
      return;
    }

    const succeeded = await onSubmit({
      book_id: parsedBookId,
      user_id: parsedUserId,
      fecha_devolucion_esperada: parsedDate.toISOString(),
    });

    if (succeeded) {
      onClose();
    }
  };

  const activeError = validationError ?? error;
  const matchedUser = users.find((user) => String(user.id) === effectiveUserId);
  const booksKey = availableBooks.map((book) => book.id).join(',');
  const usersKey = users.map((user) => user.id).join(',');

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="text-blue-gray-900">Nueva Reserva de Libro</DialogHeader>
      <DialogBody className="flex flex-col gap-4 overflow-visible pt-2">
        {activeError && (
          <Alert color="red" variant="ghost" className="text-sm">
            {activeError}
          </Alert>
        )}

        {availableBooks.length === 0 ? (
          <Alert color="amber" variant="ghost" className="text-sm">
            No hay libros disponibles en este momento para crear una nueva reserva.
          </Alert>
        ) : (
          <Select
            key={`books-${booksKey}`}
            label="Libro disponible"
            value={effectiveBookId}
            onChange={(value?: string) => setSelectedBookId(value ?? '')}
            disabled={submitting}
            menuProps={{ className: 'max-h-52 overflow-y-auto z-[9999]' }}
          >
            {availableBooks.map((book) => (
              <Option key={book.id} value={String(book.id)}>
                {book.titulo} — {book.autor}
              </Option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Select
              key={`users-${usersKey}`}
              label="Usuario"
              value={matchedUser ? String(matchedUser.id) : ''}
              onChange={(value?: string) => {
                if (value !== undefined) {
                  setSelectedUserId(value);
                }
              }}
              disabled={submitting || users.length === 0}
              menuProps={{ className: 'max-h-52 overflow-y-auto z-[9999]' }}
            >
              {users.map((user) => (
                <Option key={user.id} value={String(user.id)}>
                  {user.nombre} ({user.email})
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Input
              label="ID usuario"
              type="number"
              min={1}
              step={1}
              value={effectiveUserId}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSelectedUserId(event.target.value)
              }
              disabled={submitting}
              required
              crossOrigin={undefined}
            />
          </div>
        </div>

        <Input
          label="Fecha de devolución esperada"
          type="datetime-local"
          value={expectedReturnDate}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setExpectedReturnDate(event.target.value)
          }
          disabled={submitting}
          required
          crossOrigin={undefined}
        />

        <Typography variant="small" color="gray" className="text-xs font-normal">
          Al registrar la reserva, el libro cambiará automáticamente a estado Reservado.
        </Typography>
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button
          variant="text"
          color="blue-gray"
          onClick={onClose}
          disabled={submitting}
          type="button"
        >
          Cancelar
        </Button>
        <Button
          variant="filled"
          color="blue"
          type="submit"
          disabled={submitting || availableBooks.length === 0}
          className="inline-flex items-center gap-2"
        >
          {submitting && <Spinner className="h-4 w-4" />}
          <span>Confirmar Reserva</span>
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ReservationModal({
  open,
  availableBooks,
  users,
  submitting,
  error,
  onClose,
  onSubmit,
}: ReservationModalProps) {
  const handleDialogToggle = (): void => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} handler={handleDialogToggle} size="md">
      <ReservationFormContent
        key={open ? 'open' : 'closed'}
        availableBooks={availableBooks}
        users={users}
        submitting={submitting}
        error={error}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}
