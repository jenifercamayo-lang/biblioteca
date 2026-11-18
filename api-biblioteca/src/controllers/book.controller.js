import { AppDataSource } from '../config/database.js';
import { BookModel } from '../models/book.model.js';

const getBookRepository = () => AppDataSource.getRepository(BookModel);

/**
 * Valida y convierte el parámetro de ruta :id a un entero positivo.
 */
const parseBookId = (rawId) => {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * Centraliza el manejo de errores de MySQL/TypeORM en los controladores.
 */
const handleControllerError = (res, error, context) => {
  const errorCode = error?.driverError?.code ?? error?.code;

  if (errorCode === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Ya existe un libro registrado con ese ISBN.',
    });
  }

  console.error(`[BookController:${context}]`, error);
  return res.status(500).json({
    message: 'Error interno del servidor.',
  });
};

/**
 * Valida los campos de entrada para crear o actualizar un libro.
 */
const validateBookPayload = (payload, { partial = false } = {}) => {
  const errors = [];
  const { titulo, autor, isbn, año_publicacion, disponibilidad } = payload ?? {};

  if (!partial || titulo !== undefined) {
    if (typeof titulo !== 'string' || titulo.trim().length === 0) {
      errors.push('El campo "titulo" es obligatorio y debe ser texto no vacío.');
    }
  }

  if (!partial || autor !== undefined) {
    if (typeof autor !== 'string' || autor.trim().length === 0) {
      errors.push('El campo "autor" es obligatorio y debe ser texto no vacío.');
    }
  }

  if (!partial || isbn !== undefined) {
    if (typeof isbn !== 'string' || isbn.trim().length === 0) {
      errors.push('El campo "isbn" es obligatorio y debe ser texto no vacío.');
    }
  }

  if (!partial || año_publicacion !== undefined) {
    if (!Number.isInteger(año_publicacion) || año_publicacion <= 0) {
      errors.push('El campo "año_publicacion" es obligatorio y debe ser un número entero positivo.');
    }
  }

  if (disponibilidad !== undefined && typeof disponibilidad !== 'boolean') {
    errors.push('El campo "disponibilidad" debe ser booleano (true/false).');
  }

  return errors;
};

/**
 * GET /api/books - Obtiene el listado completo de libros.
 */
export const getAllBooks = async (_req, res) => {
  try {
    const books = await getBookRepository().find({
      order: { id: 'ASC' },
    });
    return res.status(200).json(books);
  } catch (error) {
    return handleControllerError(res, error, 'getAllBooks');
  }
};

/**
 * GET /api/books/:id - Obtiene un libro por su ID.
 */
export const getBookById = async (req, res) => {
  const id = parseBookId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
  }

  try {
    const book = await getBookRepository().findOneBy({ id });
    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado.' });
    }
    return res.status(200).json(book);
  } catch (error) {
    return handleControllerError(res, error, 'getBookById');
  }
};

/**
 * POST /api/books - Registra un nuevo libro.
 */
export const createBook = async (req, res) => {
  const validationErrors = validateBookPayload(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: 'Datos inválidos.', errors: validationErrors });
  }

  try {
    const repository = getBookRepository();
    const { titulo, autor, isbn, año_publicacion, disponibilidad } = req.body;

    const newBook = repository.create({
      titulo: titulo.trim(),
      autor: autor.trim(),
      isbn: isbn.trim(),
      año_publicacion,
      disponibilidad: disponibilidad ?? true,
    });

    const savedBook = await repository.save(newBook);
    return res.status(201).json(savedBook);
  } catch (error) {
    return handleControllerError(res, error, 'createBook');
  }
};

/**
 * PUT /api/books/:id - Actualiza un libro existente.
 */
export const updateBook = async (req, res) => {
  const id = parseBookId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
  }

  const validationErrors = validateBookPayload(req.body, { partial: true });
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: 'Datos inválidos.', errors: validationErrors });
  }

  try {
    const repository = getBookRepository();
    const existingBook = await repository.findOneBy({ id });

    if (!existingBook) {
      return res.status(404).json({ message: 'Libro no encontrado.' });
    }

    const { titulo, autor, isbn, año_publicacion, disponibilidad } = req.body;

    const updates = {
      ...(titulo !== undefined && { titulo: titulo.trim() }),
      ...(autor !== undefined && { autor: autor.trim() }),
      ...(isbn !== undefined && { isbn: isbn.trim() }),
      ...(año_publicacion !== undefined && { año_publicacion }),
      ...(disponibilidad !== undefined && { disponibilidad }),
    };

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'Debes proporcionar al menos un campo para actualizar.',
      });
    }

    repository.merge(existingBook, updates);
    const updatedBook = await repository.save(existingBook);

    return res.status(200).json(updatedBook);
  } catch (error) {
    return handleControllerError(res, error, 'updateBook');
  }
};

/**
 * DELETE /api/books/:id - Elimina un libro por su ID.
 */
export const deleteBook = async (req, res) => {
  const id = parseBookId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
  }

  try {
    const result = await getBookRepository().delete({ id });

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Libro no encontrado.' });
    }

    return res.status(200).json({ message: 'Libro eliminado correctamente.' });
  } catch (error) {
    return handleControllerError(res, error, 'deleteBook');
  }
};
