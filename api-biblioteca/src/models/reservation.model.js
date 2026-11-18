import { EntitySchema } from 'typeorm';

export const ReservationStatus = Object.freeze({
  ACTIVA: 'ACTIVA',
  DEVUELTA: 'DEVUELTA',
  VENCIDA: 'VENCIDA',
});

/**
 * Definición de la entidad Reservation (tabla intermedia con lógica de negocio).
 */
export const ReservationModel = new EntitySchema({
  name: 'Reservation',
  tableName: 'reservations',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    fecha_reserva: {
      type: 'datetime',
      createDate: true,
      nullable: false,
    },
    fecha_devolucion_esperada: {
      type: 'datetime',
      nullable: false,
    },
    fecha_devolucion_real: {
      type: 'datetime',
      nullable: true,
      default: null,
    },
    estado: {
      type: 'enum',
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.ACTIVA,
      nullable: false,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      inverseSide: 'reservations',
      nullable: false,
      onDelete: 'RESTRICT',
    },
    book: {
      type: 'many-to-one',
      target: 'Book',
      joinColumn: { name: 'book_id' },
      inverseSide: 'reservations',
      nullable: false,
      onDelete: 'RESTRICT',
    },
  },
});
