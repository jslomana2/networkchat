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

export interface CreateTicketData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  assigned_to?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
}

export interface CreatePartData {
  ticket_id: string;
  content: string;
  created_by: string;
}
