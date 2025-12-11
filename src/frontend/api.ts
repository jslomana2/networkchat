import { Ticket, Part, User, CreateTicketData, UpdateTicketData, CreatePartData, CreateUserData, UpdateUserData } from './types';

const API_URL = 'http://localhost:3001/api';

export const ticketsApi = {
  getAll: async (filters?: { status?: string; priority?: string }): Promise<Ticket[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    const url = `${API_URL}/tickets${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener tickets');
    return response.json();
  },

  getById: async (id: string): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/tickets/${id}`);
    if (!response.ok) throw new Error('Error al obtener ticket');
    return response.json();
  },

  create: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear ticket');
    return response.json();
  },

  update: async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar ticket');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar ticket');
  },

  close: async (id: string): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/tickets/${id}/close`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Error al cerrar ticket');
    return response.json();
  },
};

export const partsApi = {
  getByTicketId: async (ticketId: string): Promise<Part[]> => {
    const response = await fetch(`${API_URL}/parts/ticket/${ticketId}`);
    if (!response.ok) throw new Error('Error al obtener partes');
    return response.json();
  },

  create: async (data: CreatePartData): Promise<Part> => {
    const response = await fetch(`${API_URL}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear parte');
    return response.json();
  },

  update: async (id: string, content: string): Promise<Part> => {
    const response = await fetch(`${API_URL}/parts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Error al actualizar parte');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/parts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar parte');
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  },

  getById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear usuario');
    }
    return response.json();
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar usuario');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar usuario');
    }
  },
};
