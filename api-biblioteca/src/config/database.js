import { DataSource } from 'typeorm';
import { BookModel } from '../models/book.model.js';
import { UserModel } from '../models/user.model.js';
import { ReservationModel } from '../models/reservation.model.js';

/**
 * Configuración del DataSource de TypeORM para MySQL.
 * Las variables de entorno se inyectan de forma nativa con `node --env-file=.env`.
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'biblioteca_db',
  synchronize: true,
  logging: false,
  entities: [BookModel, UserModel, ReservationModel],
});
