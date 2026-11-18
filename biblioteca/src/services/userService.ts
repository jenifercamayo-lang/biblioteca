import { axiosInstance, isNotFoundError } from '../api/axiosInstance';
import type { Reservation } from '../types/reservation.types';
import type { User } from '../types/user.types';

const USERS_ENDPOINT = '/api/users';

const FALLBACK_LIBRARY_USERS: readonly User[] = [
  { id: 1, nombre: 'Ana García', email: 'ana@ejemplo.com' },
  { id: 2, nombre: 'Carlos Mendoza', email: 'carlos@ejemplo.com' },
  { id: 3, nombre: 'Laura Fernández', email: 'laura@ejemplo.com' },
  { id: 4, nombre: 'Javier Torres', email: 'javier@ejemplo.com' },
  { id: 5, nombre: 'Sofía Ramírez', email: 'sofia@ejemplo.com' },
];

export function mergeUsersWithReservations(
  baseUsers: readonly User[],
  reservations: readonly Reservation[]
): User[] {
  const userMap = new Map<number, User>();

  for (const user of baseUsers) {
    userMap.set(user.id, user);
  }

  for (const reservation of reservations) {
    if (!userMap.has(reservation.user.id)) {
      userMap.set(reservation.user.id, reservation.user);
    }
  }

  return Array.from(userMap.values()).sort((a, b) => a.id - b.id);
}

export const userService = {
  async getAll(reservations: readonly Reservation[] = []): Promise<User[]> {
    try {
      const response = await axiosInstance.get<User[]>(USERS_ENDPOINT);
      return mergeUsersWithReservations(response.data, reservations);
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        return mergeUsersWithReservations(FALLBACK_LIBRARY_USERS, reservations);
      }
      throw error;
    }
  },
};
