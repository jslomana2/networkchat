import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev
  ? path.join(process.cwd(), 'tickets.db')
  : path.join(app?.getPath('userData') || process.cwd(), 'tickets.db');

const db = new Database(dbPath);

// Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'technician',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    created_by TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    closed_at INTEGER,
    FOREIGN KEY (assigned_to) REFERENCES users(name)
  );

  CREATE TABLE IF NOT EXISTS parts (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_parts_ticket_id ON parts(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
`);

export default db;

export interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'admin' | 'technician';
  created_at: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  assigned_to: string;
  created_at: number;
  updated_at: number;
  closed_at: number | null;
}

export interface Part {
  id: string;
  ticket_id: string;
  content: string;
  created_by: string;
  created_at: number;
  updated_at: number;
}
