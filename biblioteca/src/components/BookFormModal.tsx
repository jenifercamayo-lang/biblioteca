import type React from 'react';
import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Spinner,
} from '@material-tailwind/react';
import type { Book, CreateBookDto } from '../types/book.types';

export interface BookFormModalProps {
  open: boolean;
  bookToEdit: Book | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: CreateBookDto) => Promise<boolean>;
}

interface BookFormContentProps {
  bookToEdit: Book | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: CreateBookDto) => Promise<boolean>;
}

function BookFormContent({
  bookToEdit,
  submitting,
  error,
  onClose,
  onSubmit,
}: BookFormContentProps) {
  const [titulo, setTitulo] = useState<string>(() => bookToEdit?.titulo ?? '');
  const [autor, setAutor] = useState<string>(() => bookToEdit?.autor ?? '');
  const [isbn, setIsbn] = useState<string>(() => bookToEdit?.isbn ?? '');
  const [anioPublicacion, setAnioPublicacion] = useState<string>(() =>
    bookToEdit ? String(bookToEdit.año_publicacion) : ''
  );
  const [disponibilidad, setDisponibilidad] = useState<boolean>(() =>
    bookToEdit ? bookToEdit.disponibilidad : true
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setValidationError(null);

    const trimmedTitulo = titulo.trim();
    const trimmedAutor = autor.trim();
    const trimmedIsbn = isbn.trim();
    const parsedYear = Number(anioPublicacion.trim());

    if (!trimmedTitulo) {
      setValidationError('El título del libro es obligatorio.');
      return;
    }

    if (!trimmedAutor) {
      setValidationError('El autor del libro es obligatorio.');
      return;
    }

    if (!trimmedIsbn) {
      setValidationError('El ISBN del libro es obligatorio.');
      return;
    }

    if (!Number.isInteger(parsedYear) || parsedYear <= 0) {
      setValidationError('El año de publicación debe ser un número entero positivo.');
      return;
    }

    const succeeded = await onSubmit({
      titulo: trimmedTitulo,
      autor: trimmedAutor,
      isbn: trimmedIsbn,
      año_publicacion: parsedYear,
      disponibilidad,
    });

    if (succeeded) {
      onClose();
    }
  };

  const activeError = validationError ?? error;

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="text-blue-gray-900">
        {bookToEdit ? `Editar Libro #${bookToEdit.id}` : 'Registrar Nuevo Libro'}
      </DialogHeader>
      <DialogBody className="flex flex-col gap-4 pt-2">
        {activeError && (
          <Alert color="red" variant="ghost" className="text-sm">
            {activeError}
          </Alert>
        )}

        <Input
          label="Título"
          value={titulo}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTitulo(event.target.value)}
          disabled={submitting}
          required
          crossOrigin={undefined}
        />

        <Input
          label="Autor"
          value={autor}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAutor(event.target.value)}
          disabled={submitting}
          required
          crossOrigin={undefined}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="ISBN"
            value={isbn}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIsbn(event.target.value)}
            disabled={submitting}
            required
            crossOrigin={undefined}
          />

          <Input
            label="Año de publicación"
            type="number"
            min={1}
            step={1}
            value={anioPublicacion}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAnioPublicacion(event.target.value)
            }
            disabled={submitting}
            required
            crossOrigin={undefined}
          />
        </div>

        <div className="-ml-2">
          <Checkbox
            label="Disponible para reserva"
            color="blue"
            checked={disponibilidad}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDisponibilidad(event.target.checked)
            }
            disabled={submitting}
            crossOrigin={undefined}
          />
        </div>
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
          disabled={submitting}
          className="inline-flex items-center gap-2"
        >
          {submitting && <Spinner className="h-4 w-4" />}
          <span>{bookToEdit ? 'Guardar Cambios' : 'Crear Libro'}</span>
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BookFormModal({
  open,
  bookToEdit,
  submitting,
  error,
  onClose,
  onSubmit,
}: BookFormModalProps) {
  const handleDialogToggle = (): void => {
    if (!submitting) {
      onClose();
    }
  };

  const formKey = `${bookToEdit?.id ?? 'new'}-${open ? 'open' : 'closed'}`;

  return (
    <Dialog open={open} handler={handleDialogToggle} size="md">
      <BookFormContent
        key={formKey}
        bookToEdit={bookToEdit}
        submitting={submitting}
        error={error}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}
