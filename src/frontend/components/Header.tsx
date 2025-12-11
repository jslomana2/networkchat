import React, { useState } from 'react';

interface HeaderProps {
  currentUser: string;
  onUserChange: (user: string) => void;
  onCreateTicket: () => void;
  onManageUsers: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onUserChange, onCreateTicket, onManageUsers }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState(currentUser);

  const handleSave = () => {
    if (tempUser.trim()) {
      onUserChange(tempUser.trim());
      setIsEditing(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Ticketing
          </h1>
          <span className="text-sm text-gray-500">Red Local</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Usuario:</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempUser}
                  onChange={(e) => setTempUser(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="px-2 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setTempUser(currentUser);
                    setIsEditing(false);
                  }}
                  className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                {currentUser}
              </button>
            )}
          </div>

          <button
            onClick={onManageUsers}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            👥 Usuarios
          </button>

          <button
            onClick={onCreateTicket}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Nuevo Ticket
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
