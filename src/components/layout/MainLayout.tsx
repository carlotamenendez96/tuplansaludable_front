
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User, UserRole } from '../../types';
import { MOCK_USERS } from '../../constants';

interface MainLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, onLogout }) => {
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser.role === UserRole.TRAINER) {
      const trainerClients = MOCK_USERS.filter(u => currentUser.clients?.includes(u.id));
      setClients(trainerClients);
      if(trainerClients.length > 0) {
        //setSelectedClient(trainerClients[0]);
      }
    }
  }, [currentUser]);

  const handleClientSelect = (client: User) => {
    setSelectedClient(client);
    navigate(`/client/${client.id}/dashboard`);
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar 
        user={currentUser} 
        onLogout={onLogout}
        clients={clients}
        onClientSelect={handleClientSelect}
        selectedClient={selectedClient}
      />
      <main className="flex-1 ml-72 p-8 overflow-y-auto">
        {currentUser.role === UserRole.TRAINER && selectedClient && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-secondary/50">
            <h2 className="text-xl font-bold text-text-base">
              Viendo el perfil de: <span className="text-secondary">{selectedClient.name}</span>
            </h2>
            <p className="text-sm text-text-muted">Puedes gestionar los planes, seguimiento y chat de este cliente.</p>
          </div>
        )}
        <Outlet context={{ selectedClient }} />
      </main>
    </div>
  );
};

export default MainLayout;
