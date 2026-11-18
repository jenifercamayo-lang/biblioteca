import { EntitySchema } from 'typeorm';

/**
 * Definición de la entidad User para MySQL usando EntitySchema (ES Modules nativo).
 */
export const UserModel = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    nombre: {
      type: 'varchar',
      length: 150,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 150,
      unique: true,
      nullable: false,
    },
  },
  relations: {
    reservations: {
      type: 'one-to-many',
      target: 'Reservation',
      inverseSide: 'user',
    },
  },
});
