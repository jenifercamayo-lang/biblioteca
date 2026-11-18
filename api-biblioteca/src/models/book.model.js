import { EntitySchema } from 'typeorm';

/**
 * Definición de la entidad Book para MySQL usando EntitySchema (ES Modules nativo).
 */
export const BookModel = new EntitySchema({
  name: 'Book',
  tableName: 'books',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    titulo: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    autor: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    isbn: {
      type: 'varchar',
      length: 20,
      unique: true,
      nullable: false,
    },
    año_publicacion: {
      // Se utiliza 'int' para admitir años anteriores a 1901 (el tipo YEAR de MySQL solo cubre 1901-2155).
      type: 'int',
      nullable: false,
    },
    disponibilidad: {
      // TypeORM mapea 'boolean' a TINYINT(1) en MySQL.
      type: 'boolean',
      default: true,
      nullable: false,
    },
  },
  relations: {
    reservations: {
      type: 'one-to-many',
      target: 'Reservation',
      inverseSide: 'book',
    },
  },
});
