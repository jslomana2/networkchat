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
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    created_by TEXT NOT NULL,
    assigned_to TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    closed_at INTEGER
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
  CREATE INDEX IF NOT EXISTS idx_parts_ticket_id ON parts(ticket_id);
`);

export default db;

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  assigned_to: string | null;
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
