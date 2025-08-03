
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User, UserRole } from '../../types';
import { MOCK_USERS } from '../../constants';
import * as apiService from '../../services/apiService';

interface MainLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, onLogout }) => {
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchClients = async () => {
      if (currentUser.role === UserRole.TRAINER) {
        try {
          const response = await apiService.clients.getTrainerClients();
          setClients(response.data.data || []);
        } catch (error) {
          console.error('Error fetching clients:', error);
          // Fallback a datos mock si hay error
          const trainerClients = MOCK_USERS.filter(u => u.role === UserRole.USER);
          setClients(trainerClients);
        }
      }
    };

    fetchClients();
  }, [currentUser]);

  // Detectar automáticamente el cliente seleccionado basándose en la URL
  useEffect(() => {
    if (currentUser.role === UserRole.TRAINER && clients.length > 0) {
      const pathMatch = location.pathname.match(/\/client\/([^\/]+)/);
      if (pathMatch) {
        const clientId = pathMatch[1];
        const client = clients.find(c => (c._id || c.id) === clientId);
        if (client && (!selectedClient || selectedClient._id !== client._id)) {
          setSelectedClient(client);
        }
      } else {
        // Si no estamos en una ruta de cliente, limpiar la selección
        if (selectedClient) {
          setSelectedClient(null);
        }
      }
    }
  }, [location.pathname, clients, currentUser.role, selectedClient]);

  const handleClientSelect = (client: User) => {
    setSelectedClient(client);
    navigate(`/client/${client._id || client.id}/dashboard`);
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
              Viendo el perfil de: <span className="text-secondary">{selectedClient.fullName || `${selectedClient.firstName} ${selectedClient.lastName}` || selectedClient.name}</span>
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
