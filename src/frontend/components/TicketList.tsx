import React from 'react';
import { Ticket } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  onFilterChange: (filter: { status?: string; priority?: string }) => void;
  filter: { status?: string; priority?: string };
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  loading,
  selectedTicket,
  onSelectTicket,
  onFilterChange,
  filter,
}) => {
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

  const statusLabels = {
    open: 'Abierto',
    in_progress: 'En Progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Hace menos de 1h';
    if (hours < 24) return `Hace ${hours}h`;
    if (days === 1) return 'Hace 1 día';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Tickets</h2>

        <div className="space-y-2">
          <select
            value={filter.status || ''}
            onChange={(e) => onFilterChange({ ...filter, status: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="open">Abiertos</option>
            <option value="in_progress">En Progreso</option>
            <option value="resolved">Resueltos</option>
            <option value="closed">Cerrados</option>
          </select>

          <select
            value={filter.priority || ''}
            onChange={(e) => onFilterChange({ ...filter, priority: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Cargando...</div>
        ) : tickets.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay tickets</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-primary-50 border-l-4 border-primary-600'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {ticket.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      priorityColors[ticket.priority]
                    }`}
                  >
                    {priorityLabels[ticket.priority]}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {ticket.description}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusColors[ticket.status]
                    }`}
                  >
                    {statusLabels[ticket.status]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
