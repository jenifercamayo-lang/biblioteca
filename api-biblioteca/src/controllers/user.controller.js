import { AppDataSource } from '../config/database.js';
import { UserModel } from '../models/user.model.js';
import { ReservationModel } from '../models/reservation.model.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePositiveId(rawId) {
    const id = Number(rawId);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validateUserInput({ nombre, email }, { partial = false } = {}) {
    const errors = [];

    if (!partial || nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim().length === 0) {
            errors.push('El campo "nombre" es obligatorio y debe ser texto no vacío.');
        }
    }

    if (!partial || email !== undefined) {
        if (
            typeof email !== 'string' ||
            email.trim().length === 0 ||
            !EMAIL_REGEX.test(email.trim())
        ) {
            errors.push('El campo "email" es obligatorio y debe tener un formato válido.');
        }
    }

    return errors;
}

export const getAllUsers = async (_req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(UserModel);
        const users = await userRepository.find({
            order: { id: 'ASC' },
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const id = parsePositiveId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
        }

        const includeReservations = req.query.includeReservations === 'true';
        const userRepository = AppDataSource.getRepository(UserModel);

        const user = await userRepository.findOne({
            where: { id },
            relations: includeReservations ? ['reservations', 'reservations.book'] : [],
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { nombre, email } = req.body ?? {};
        const errors = validateUserInput({ nombre, email }, { partial: false });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Datos inválidos.',
                errors,
            });
        }

        const normalizedNombre = nombre.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const userRepository = AppDataSource.getRepository(UserModel);
        const existingUser = await userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.email) = :email', { email: normalizedEmail })
            .getOne();

        if (existingUser) {
            return res.status(409).json({
                message: 'Ya existe un usuario registrado con ese email.',
            });
        }

        const newUser = userRepository.create({
            nombre: normalizedNombre,
            email: normalizedEmail,
        });

        const savedUser = await userRepository.save(newUser);
        return res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const id = parsePositiveId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
        }

        const { nombre, email } = req.body ?? {};
        if (nombre === undefined && email === undefined) {
            return res.status(400).json({
                message: 'Debes proporcionar al menos un campo para actualizar.',
            });
        }

        const errors = validateUserInput({ nombre, email }, { partial: true });
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Datos inválidos.',
                errors,
            });
        }

        const userRepository = AppDataSource.getRepository(UserModel);
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase();
            const duplicateUser = await userRepository
                .createQueryBuilder('user')
                .where('LOWER(user.email) = :email', { email: normalizedEmail })
                .andWhere('user.id != :id', { id })
                .getOne();

            if (duplicateUser) {
                return res.status(409).json({
                    message: 'Ya existe un usuario registrado con ese email.',
                });
            }

            user.email = normalizedEmail;
        }

        if (nombre !== undefined) {
            user.nombre = nombre.trim();
        }

        const updatedUser = await userRepository.save(user);
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const id = parsePositiveId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
        }

        const userRepository = AppDataSource.getRepository(UserModel);
        const reservationRepository = AppDataSource.getRepository(ReservationModel);

        const user = await userRepository.findOneBy({ id });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const activeReservationsCount = await reservationRepository
            .createQueryBuilder('reservation')
            .where('reservation.user = :userId', { userId: id })
            .andWhere('reservation.estado IN (:...estados)', {
                estados: ['ACTIVA', 'VENCIDA'],
            })
            .getCount();

        if (activeReservationsCount > 0) {
            return res.status(409).json({
                message:
                    'No se puede eliminar el usuario porque tiene reservas activas o vencidas pendientes de devolución.',
            });
        }

        const totalReservationsCount = await reservationRepository
            .createQueryBuilder('reservation')
            .where('reservation.user = :userId', { userId: id })
            .getCount();

        if (totalReservationsCount > 0) {
            return res.status(409).json({
                message:
                    'No se puede eliminar el usuario porque tiene historial de reservas asociadas.',
            });
        }

        await userRepository.remove(user);
        return res.status(200).json({
            message: 'Usuario eliminado correctamente.',
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};