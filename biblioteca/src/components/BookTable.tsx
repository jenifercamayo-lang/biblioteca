import type React from 'react';
import { useMemo } from 'react';
import { Button, Card, CardBody, Chip, Input, Spinner, Typography } from '@material-tailwind/react';
import type { Book } from '../types/book.types';

export interface BookTableProps {
  books: Book[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

const TABLE_HEAD: readonly string[] = [
  'ID',
  'Título',
  'Autor',
  'ISBN',
  'Año',
  'Disponibilidad',
  'Acciones',
];

export function BookTable({
  books,
  loading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}: BookTableProps) {
  const filteredBooks = useMemo((): Book[] => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return books;
    }

    return books.filter(
      (book) =>
        book.titulo.toLowerCase().includes(normalizedSearch) ||
        book.autor.toLowerCase().includes(normalizedSearch)
    );
  }, [books, searchTerm]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(event.target.value);
  };

  return (
    <Card className="w-full border border-blue-gray-100 shadow-sm">
      <CardBody className="p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h6" color="blue-gray">
              Catálogo de Libros
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              {filteredBooks.length} de {books.length} libros mostrados
            </Typography>
          </div>
          <div className="w-full sm:w-80">
            <Input
              label="Buscar por título o autor"
              value={searchTerm}
              onChange={handleSearchInputChange}
              crossOrigin={undefined}
            />
          </div>
        </div>

        {loading && books.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner className="h-8 w-8" color="blue" />
            <Typography variant="small" color="blue-gray">
              Cargando catálogo de libros...
            </Typography>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-blue-gray-200 bg-blue-gray-50/40 py-10 text-center">
            <Typography variant="paragraph" color="blue-gray" className="font-medium">
              {searchTerm.trim()
                ? 'No se encontraron libros que coincidan con tu búsqueda.'
                : 'No hay libros registrados todavía.'}
            </Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-b border-blue-gray-100 bg-blue-gray-50/60 px-4 py-3"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold leading-none opacity-80"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => {
                  const isLast = index === filteredBooks.length - 1;
                  const cellClass = isLast ? 'px-4 py-3.5' : 'border-b border-blue-gray-50 px-4 py-3.5';

                  return (
                    <tr key={book.id} className="hover:bg-blue-gray-50/30">
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          #{book.id}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {book.titulo}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {book.autor}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-mono text-xs font-medium"
                        >
                          {book.isbn}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {book.año_publicacion}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <div className="w-max">
                          <Chip
                            size="sm"
                            variant="ghost"
                            color={book.disponibilidad ? 'green' : 'red'}
                            value={book.disponibilidad ? 'Disponible' : 'Reservado'}
                          />
                        </div>
                      </td>
                      <td className={cellClass}>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outlined"
                            color="blue"
                            type="button"
                            onClick={() => onEdit(book)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="red"
                            type="button"
                            onClick={() => onDelete(book)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
