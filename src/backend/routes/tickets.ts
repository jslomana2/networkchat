import { Router, Request, Response } from 'express';
import db, { Ticket } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Obtener todos los tickets
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, priority } = req.query;
    let query = 'SELECT * FROM tickets';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const tickets = db.prepare(query).all(...params);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// Obtener un ticket por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
});

// Crear un nuevo ticket
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, priority, created_by, assigned_to } = req.body;

    if (!title || !description || !created_by) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO tickets (id, title, description, status, priority, created_by, assigned_to, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title,
      description,
      'open',
      priority || 'medium',
      created_by,
      assigned_to || null,
      now,
      now
    );

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Ticket;
    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

// Actualizar un ticket
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, assigned_to } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);

      if (status === 'closed') {
        updates.push('closed_at = ?');
        params.push(Date.now());
      }
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }

    updates.push('updated_at = ?');
    params.push(Date.now());
    params.push(req.params.id);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const stmt = db.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
});

// Eliminar un ticket
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
});

// Cerrar un ticket
router.post('/:id/close', (req: Request, res: Response) => {
  try {
    const now = Date.now();
    const stmt = db.prepare('UPDATE tickets SET status = ?, closed_at = ?, updated_at = ? WHERE id = ?');
    const result = stmt.run('closed', now, now, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar ticket' });
  }
});

export default router;
