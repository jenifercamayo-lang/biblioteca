import { useState } from 'react';
import { Alert, Button, Typography } from '@material-tailwind/react';
import { BookFormModal } from '../components/BookFormModal';
import { BookTable } from '../components/BookTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { UseBooksReturn } from '../hooks/useBooks';
import type { Book, CreateBookDto } from '../types/book.types';

export interface BooksPageProps {
  booksState: UseBooksReturn;
}

export function BooksPage({ booksState }: BooksPageProps) {
  const {
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
  } = booksState;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const handleOpenCreateModal = (): void => {
    clearFeedback();
    setBookToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (book: Book): void => {
    clearFeedback();
    setBookToEdit(book);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = (): void => {
    setIsFormModalOpen(false);
    setBookToEdit(null);
  };

  const handleFormSubmit = async (data: CreateBookDto): Promise<boolean> => {
    if (bookToEdit) {
      return updateBook(bookToEdit.id, data);
    }
    return createBook(data);
  };

  const handleRequestDelete = (book: Book): void => {
    clearFeedback();
    setBookToDelete(book);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!bookToDelete) {
      return;
    }

    const deleted = await deleteBook(bookToDelete.id);
    if (deleted) {
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = (): void => {
    if (!submitting) {
      setBookToDelete(null);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h4" color="blue-gray">
            Gestión de Libros
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            Administra el inventario del catálogo, disponibilidad y metadatos de cada ejemplar.
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outlined"
            color="blue-gray"
            size="sm"
            type="button"
            onClick={() => {
              void fetchBooks();
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
            + Nuevo Libro
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert color="green" variant="ghost" open={Boolean(successMessage)} onClose={clearFeedback}>
          {successMessage}
        </Alert>
      )}

      {error && !isFormModalOpen && (
        <Alert color="red" variant="ghost" open={Boolean(error)} onClose={clearFeedback}>
          {error}
        </Alert>
      )}

      <BookTable
        books={books}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={handleOpenEditModal}
        onDelete={handleRequestDelete}
      />

      <BookFormModal
        open={isFormModalOpen}
        bookToEdit={bookToEdit}
        submitting={submitting}
        error={error}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={bookToDelete !== null}
        title="Eliminar Libro"
        description={
          bookToDelete
            ? `¿Confirmas que deseas eliminar el libro "${bookToDelete.titulo}" (${bookToDelete.autor})? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={submitting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={handleCancelDelete}
      />
    </section>
  );
}
