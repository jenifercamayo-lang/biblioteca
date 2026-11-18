import { Router } from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  returnBook,
} from '../controllers/reservation.controller.js';

const router = Router();

router.get('/', getAllReservations);
router.get('/:id', getReservationById);
router.post('/', createReservation);
router.patch('/:id/return', returnBook);
router.put('/:id/return', returnBook);

export default router;
