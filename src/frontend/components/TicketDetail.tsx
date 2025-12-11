import React, { useState } from 'react';
import { Ticket, Part } from '../types';

interface TicketDetailProps {
  ticket: Ticket | null;
  parts: Part[];
  currentUser: string;
  onUpdateTicket: (id: string, data: any) => void;
  onDeleteTicket: (id: string) => void;
  onCloseTicket: (id: string) => void;
  onCreatePart: (ticketId: string, content: string) => void;
  onUpdatePart: (id: string, content: string) => void;
  onDeletePart: (id: string) => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  parts,
  currentUser,
  onUpdateTicket,
  onDeleteTicket,
  onCloseTicket,
  onCreatePart,
  onUpdatePart,
  onDeletePart,
}) => {
  const [newPartContent, setNewPartContent] = useState('');
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editingPartContent, setEditingPartContent] = useState('');
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editingTicketData, setEditingTicketData] = useState<any>({});

  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">
            Selecciona un ticket para ver los detalles
          </p>
        </div>
      </div>
    );
  }

  const handleSubmitPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPartContent.trim()) {
      onCreatePart(ticket.id, newPartContent);
      setNewPartContent('');
    }
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part.id);
    setEditingPartContent(part.content);
  };

  const handleSavePart = () => {
    if (editingPart && editingPartContent.trim()) {
      onUpdatePart(editingPart, editingPartContent);
      setEditingPart(null);
      setEditingPartContent('');
    }
  };

  const handleCancelEditPart = () => {
    setEditingPart(null);
    setEditingPartContent('');
  };

  const handleEditTicket = () => {
    setIsEditingTicket(true);
    setEditingTicketData({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assigned_to: ticket.assigned_to || '',
    });
  };

  const handleSaveTicket = () => {
    onUpdateTicket(ticket.id, editingTicketData);
    setIsEditingTicket(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES');
  };

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header del ticket */}
      <div className="border-b border-gray-200 p-6">
        {isEditingTicket ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editingTicketData.title}
              onChange={(e) =>
                setEditingTicketData({ ...editingTicketData, title: e.target.value })
              }
              className="w-full text-2xl font-bold border-b-2 border-primary-600 focus:outline-none"
            />
            <textarea
              value={editingTicketData.description}
              onChange={(e) =>
                setEditingTicketData({ ...editingTicketData, description: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
            />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={editingTicketData.status}
                  onChange={(e) =>
                    setEditingTicketData({ ...editingTicketData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="open">Abierto</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="resolved">Resuelto</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={editingTicketData.priority}
                  onChange={(e) =>
                    setEditingTicketData({ ...editingTicketData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asignado a
                </label>
                <input
                  type="text"
                  value={editingTicketData.assigned_to}
                  onChange={(e) =>
                    setEditingTicketData({ ...editingTicketData, assigned_to: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Sin asignar"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTicket}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingTicket(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleEditTicket}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Editar
                </button>
                {ticket.status !== 'closed' && (
                  <button
                    onClick={() => onCloseTicket(ticket.id)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Cerrar Ticket
                  </button>
                )}
                <button
                  onClick={() => onDeleteTicket(ticket.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{ticket.description}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-600">Estado: </span>
                <span className={`px-2 py-1 rounded font-medium ${statusColors[ticket.status]}`}>
                  {ticket.status === 'open' && 'Abierto'}
                  {ticket.status === 'in_progress' && 'En Progreso'}
                  {ticket.status === 'resolved' && 'Resuelto'}
                  {ticket.status === 'closed' && 'Cerrado'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Prioridad: </span>
                <span className={`px-2 py-1 rounded font-medium ${priorityColors[ticket.priority]}`}>
                  {ticket.priority === 'low' && 'Baja'}
                  {ticket.priority === 'medium' && 'Media'}
                  {ticket.priority === 'high' && 'Alta'}
                  {ticket.priority === 'urgent' && 'Urgente'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Creado por: </span>
                <span className="font-medium">{ticket.created_by}</span>
              </div>
              {ticket.assigned_to && (
                <div>
                  <span className="text-gray-600">Asignado a: </span>
                  <span className="font-medium">{ticket.assigned_to}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Creado: </span>
                <span>{formatDate(ticket.created_at)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Partes */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <h3 className="text-lg font-semibold mb-4">
          Partes de trabajo ({parts.length})
        </h3>

        <div className="space-y-4">
          {parts.map((part) => (
            <div key={part.id} className="bg-gray-50 rounded-lg p-4">
              {editingPart === part.id ? (
                <div>
                  <textarea
                    value={editingPartContent}
                    onChange={(e) => setEditingPartContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePart}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEditPart}
                      className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{part.created_by}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDate(part.created_at)}
                        {part.updated_at !== part.created_at && ' (editado)'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPart(part)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDeletePart(part.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{part.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulario para nuevo parte */}
      <div className="border-t border-gray-200 p-6">
        <form onSubmit={handleSubmitPart}>
          <textarea
            value={newPartContent}
            onChange={(e) => setNewPartContent(e.target.value)}
            placeholder="Añadir un nuevo parte de trabajo..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newPartContent.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Añadir Parte
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
