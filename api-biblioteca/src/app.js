import express from 'express';
import cors from 'cors'
import { AppDataSource } from './config/database.js';
import bookRoutes from './routes/book.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware nativo de Express para parsear JSON en el cuerpo de las peticiones
app.use(express.json());
app.use(cors());
// Endpoint de verificación rápida del estado del servicio
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas de los recursos
app.use('/api/books', bookRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// Manejador de rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

/**
 * Inicializa la conexión a MySQL con TypeORM antes de levantar el servidor HTTP.
 */
async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Conexión a MySQL establecida correctamente con TypeORM.');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar la base de datos o el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
