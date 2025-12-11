import { Router, Request, Response } from 'express';
import db, { User } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Obtener todos los usuarios
router.get('/', (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY name ASC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear un nuevo usuario
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Verificar si el usuario ya existe
    const existing = db.prepare('SELECT id FROM users WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });
    }

    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, name, email || null, role || 'technician', now);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar un usuario
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      // Verificar si el nuevo nombre ya existe (en otro usuario)
      const existing = db
        .prepare('SELECT id FROM users WHERE name = ? AND id != ?')
        .get(name, req.params.id);
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });
      }
      updates.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    params.push(req.params.id);

    const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario
router.delete('/:id', (req: Request, res: Response) => {
  try {
    // Verificar si el usuario tiene tickets asignados
    const ticketCount = db
      .prepare('SELECT COUNT(*) as count FROM tickets WHERE assigned_to = (SELECT name FROM users WHERE id = ?)')
      .get(req.params.id) as { count: number };

    if (ticketCount.count > 0) {
      return res.status(400).json({
        error: `No se puede eliminar el usuario porque tiene ${ticketCount.count} ticket(s) asignado(s)`,
      });
    }

    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
