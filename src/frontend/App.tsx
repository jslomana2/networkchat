import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Ticket, Part, User } from './types';
import { ticketsApi, partsApi, usersApi } from './api';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import CreateTicketModal from './components/CreateTicketModal';
import Header from './components/Header';

let socket: Socket;

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status?: string; priority?: string }>({});
  const [currentUser, setCurrentUser] = useState('Usuario');

  useEffect(() => {
    // Conectar a Socket.IO
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Conectado al servidor');
    });

    socket.on('ticket:created', (ticket: Ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    });

    socket.on('ticket:updated', (updatedTicket: Ticket) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
      if (selectedTicket && selectedTicket.id === updatedTicket.id) {
        setSelectedTicket(updatedTicket);
      }
    });

    socket.on('ticket:deleted', (ticketId: string) => {
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(null);
      }
    });

    socket.on('part:created', (part: Part) => {
      if (selectedTicket && selectedTicket.id === part.ticket_id) {
        setParts((prev) => [...prev, part]);
      }
    });

    socket.on('part:updated', (updatedPart: Part) => {
      setParts((prev) =>
        prev.map((p) => (p.id === updatedPart.id ? updatedPart : p))
      );
    });

    socket.on('part:deleted', (partId: string) => {
      setParts((prev) => prev.filter((p) => p.id !== partId));
    });

    socket.on('user:created', (user: User) => {
      setUsers((prev) => [...prev, user]);
    });

    socket.on('user:updated', (updatedUser: User) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    });

    socket.on('user:deleted', (userId: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    });

    loadTickets();
    loadUsers();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filter]);

  useEffect(() => {
    if (selectedTicket) {
      loadParts(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getAll(filter);
      setTickets(data);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const loadParts = async (ticketId: string) => {
    try {
      const data = await partsApi.getByTicketId(ticketId);
      setParts(data);
    } catch (error) {
      console.error('Error al cargar partes:', error);
    }
  };

  const handleCreateTicket = async (data: any) => {
    try {
      const ticket = await ticketsApi.create({ ...data, created_by: currentUser });
      socket.emit('ticket:created', ticket);
      setTickets([ticket, ...tickets]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error al crear ticket:', error);
      alert('Error al crear ticket');
    }
  };

  const handleUpdateTicket = async (id: string, data: any) => {
    try {
      const ticket = await ticketsApi.update(id, data);
      socket.emit('ticket:updated', ticket);
      setTickets(tickets.map((t) => (t.id === id ? ticket : t)));
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(ticket);
      }
    } catch (error) {
      console.error('Error al actualizar ticket:', error);
      alert('Error al actualizar ticket');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ticket?')) return;

    try {
      await ticketsApi.delete(id);
      socket.emit('ticket:deleted', id);
      setTickets(tickets.filter((t) => t.id !== id));
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error al eliminar ticket:', error);
      alert('Error al eliminar ticket');
    }
  };

  const handleCloseTicket = async (id: string) => {
    try {
      const ticket = await ticketsApi.close(id);
      socket.emit('ticket:updated', ticket);
      setTickets(tickets.map((t) => (t.id === id ? ticket : t)));
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(ticket);
      }
    } catch (error) {
      console.error('Error al cerrar ticket:', error);
      alert('Error al cerrar ticket');
    }
  };

  const handleCreatePart = async (ticketId: string, content: string) => {
    try {
      const part = await partsApi.create({
        ticket_id: ticketId,
        content,
        created_by: currentUser,
      });
      socket.emit('part:created', part);
      setParts([...parts, part]);
    } catch (error) {
      console.error('Error al crear parte:', error);
      alert('Error al crear parte');
    }
  };

  const handleUpdatePart = async (id: string, content: string) => {
    try {
      const part = await partsApi.update(id, content);
      socket.emit('part:updated', part);
      setParts(parts.map((p) => (p.id === id ? part : p)));
    } catch (error) {
      console.error('Error al actualizar parte:', error);
      alert('Error al actualizar parte');
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este parte?')) return;

    try {
      await partsApi.delete(id);
      socket.emit('part:deleted', id);
      setParts(parts.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar parte:', error);
      alert('Error al eliminar parte');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onCreateTicket={() => setIsCreateModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <TicketList
          tickets={tickets}
          loading={loading}
          selectedTicket={selectedTicket}
          onSelectTicket={setSelectedTicket}
          onFilterChange={setFilter}
          filter={filter}
        />

        <TicketDetail
          ticket={selectedTicket}
          parts={parts}
          currentUser={currentUser}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
          onCloseTicket={handleCloseTicket}
          onCreatePart={handleCreatePart}
          onUpdatePart={handleUpdatePart}
          onDeletePart={handleDeletePart}
        />
      </div>

      {isCreateModalOpen && (
        <CreateTicketModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateTicket}
          users={users}
        />
      )}
    </div>
  );
}

export default App;
