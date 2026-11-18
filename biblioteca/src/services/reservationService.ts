import { axiosInstance } from '../api/axiosInstance';
import type { CreateReservationDto, Reservation } from '../types/reservation.types';

const RESERVATIONS_ENDPOINT = '/api/reservations';

export const reservationService = {
  async getAll(): Promise<Reservation[]> {
    const response = await axiosInstance.get<Reservation[]>(RESERVATIONS_ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Reservation> {
    const response = await axiosInstance.get<Reservation>(`${RESERVATIONS_ENDPOINT}/${id}`);
    return response.data;
  },

  async create(payload: CreateReservationDto): Promise<Reservation> {
    const response = await axiosInstance.post<Reservation>(RESERVATIONS_ENDPOINT, payload);
    return response.data;
  },

  async returnBook(id: number): Promise<Reservation> {
    const response = await axiosInstance.patch<Reservation>(
      `${RESERVATIONS_ENDPOINT}/${id}/return`
    );
    return response.data;
  },
};
