import { Button, Card, CardBody, Chip, Spinner, Typography } from '@material-tailwind/react';
import type { Reservation, ReservationStatus } from '../types/reservation.types';

export interface ReservationTableProps {
  reservations: Reservation[];
  loading: boolean;
  returningId: number | null;
  onReturnBook: (reservation: Reservation) => void;
}

const TABLE_HEAD: readonly string[] = [
  'ID',
  'Libro',
  'Usuario',
  'Fecha Reserva',
  'Devolución Esperada',
  'Devolución Real',
  'Estado',
  'Acción',
];

const STATUS_CHIP_CONFIG: Record<
  ReservationStatus,
  { label: string; color: 'blue' | 'green' | 'red' }
> = {
  ACTIVA: { label: 'ACTIVA', color: 'blue' },
  DEVUELTA: { label: 'DEVUELTA', color: 'green' },
  VENCIDA: { label: 'VENCIDA', color: 'red' },
};

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatIsoDate(isoDate: string | null): string {
  if (!isoDate) {
    return '—';
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Fecha inválida';
  }

  return dateFormatter.format(parsed);
}

export function ReservationTable({
  reservations,
  loading,
  returningId,
  onReturnBook,
}: ReservationTableProps) {

  console.log(reservations)
  return (
    <Card className="w-full border border-blue-gray-100 shadow-sm">
      <CardBody className="p-4 sm:p-6">
        <div className="mb-5">
          <Typography variant="h6" color="blue-gray">
            Historial y Reservas Activas
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            {reservations.length} reservas registradas
          </Typography>
        </div>

        {loading && reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner className="h-8 w-8" color="blue" />
            <Typography variant="small" color="blue-gray">
              Cargando reservas...
            </Typography>
          </div>
        ) : reservations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-blue-gray-200 bg-blue-gray-50/40 py-10 text-center">
            <Typography variant="paragraph" color="blue-gray" className="font-medium">
              No hay reservas que mostrar en esta vista.
            </Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] table-auto text-left">
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
                {reservations.map((reservation, index) => {
                  const isLast = index === reservations.length - 1;
                  const cellClass = isLast ? 'px-4 py-3.5' : 'border-b border-blue-gray-50 px-4 py-3.5';
                  const chipConfig = STATUS_CHIP_CONFIG[reservation.estado];
                  const canReturn =
                    reservation.estado === 'ACTIVA' || reservation.estado === 'VENCIDA';
                  const isReturning = returningId === reservation.id;

                  return (
                    <tr key={reservation.id} className="hover:bg-blue-gray-50/30">
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          #{reservation.id}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {reservation.book.titulo}
                        </Typography>
                        <Typography variant="small" color="gray" className="text-xs font-normal">
                          {reservation.book.autor}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          {reservation.user.nombre}
                        </Typography>
                        <Typography variant="small" color="gray" className="text-xs font-normal">
                          {reservation.user.email}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {formatIsoDate(reservation.fecha_reserva)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {formatIsoDate(reservation.fecha_devolucion_esperada)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {formatIsoDate(reservation.fecha_devolucion_real)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <div className="w-max">
                          <Chip
                            size="sm"
                            variant="ghost"
                            color={chipConfig.color}
                            value={chipConfig.label}
                          />
                        </div>
                      </td>
                      <td className={cellClass}>
                        {canReturn ? (
                          <Button
                            size="sm"
                            variant="filled"
                            color="green"
                            type="button"
                            disabled={returningId !== null}
                            onClick={() => onReturnBook(reservation)}
                            className="inline-flex items-center gap-2"
                          >
                            {isReturning && <Spinner className="h-3.5 w-3.5" />}
                            <span>{isReturning ? 'Devolviendo...' : 'Devolver libro'}</span>
                          </Button>
                        ) : (
                          <Typography variant="small" color="gray" className="font-medium">
                            Completada
                          </Typography>
                        )}
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
