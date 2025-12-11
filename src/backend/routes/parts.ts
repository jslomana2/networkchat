import { Router, Request, Response } from 'express';
import db, { Part } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Obtener todos los partes de un ticket
router.get('/ticket/:ticketId', (req: Request, res: Response) => {
  try {
    const parts = db
      .prepare('SELECT * FROM parts WHERE ticket_id = ? ORDER BY created_at ASC')
      .all(req.params.ticketId);
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener partes' });
  }
});

// Obtener un parte por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Parte no encontrado' });
    }
    res.json(part);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener parte' });
  }
});

// Crear un nuevo parte
router.post('/', (req: Request, res: Response) => {
  try {
    const { ticket_id, content, created_by } = req.body;

    if (!ticket_id || !content || !created_by) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar que el ticket existe
    const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(ticket_id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO parts (id, ticket_id, content, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, ticket_id, content, created_by, now, now);

    // Actualizar el timestamp del ticket
    db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?').run(now, ticket_id);

    const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(id) as Part;
    res.status(201).json(part);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear parte' });
  }
});

// Actualizar un parte
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    const now = Date.now();
    const stmt = db.prepare('UPDATE parts SET content = ?, updated_at = ? WHERE id = ?');
    const result = stmt.run(content, now, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Parte no encontrado' });
    }

    const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id) as Part;

    // Actualizar el timestamp del ticket
    db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?').run(now, part.ticket_id);

    res.json(part);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar parte' });
  }
});

// Eliminar un parte
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id) as Part;

    if (!part) {
      return res.status(404).json({ error: 'Parte no encontrado' });
    }

    const stmt = db.prepare('DELETE FROM parts WHERE id = ?');
    stmt.run(req.params.id);

    // Actualizar el timestamp del ticket
    db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?').run(Date.now(), part.ticket_id);

    res.json({ message: 'Parte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar parte' });
  }
});

export default router;
