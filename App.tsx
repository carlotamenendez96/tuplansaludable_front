import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './src/components/auth/Login';
import MainLayout from './src/components/layout/MainLayout';
import { User, UserRole } from './src/types';
import DashboardPage from './src/pages/DashboardPage';
import DietPage from './src/pages/DietPage';
import WorkoutPage from './src/pages/WorkoutPage';
import TrackingPage from './src/pages/TrackingPage';
import ResourcesPage from './src/pages/ResourcesPage';
import ChatPage from './src/pages/ChatPage';
import RecipesPage from './src/pages/RecipesPage';
import { auth, clients } from './src/services/apiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await auth.getMe();
          setCurrentUser(response.data.data);
        } catch (error) {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, []);

  const handleLogin = useCallback((user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Cargando...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        
        {currentUser ? (
          <Route path="/" element={<MainLayout currentUser={currentUser} onLogout={handleLogout} />}>
            {/* User Routes */}
            {currentUser.role === UserRole.USER && (
                <>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<DashboardPage currentUser={currentUser} />} />
                    <Route path="diet" element={<DietPage userId={currentUser.id} />} />
                    <Route path="workout" element={<WorkoutPage userId={currentUser.id} />} />
                    <Route path="tracking" element={<TrackingPage userId={currentUser.id} />} />
                    <Route path="recipes" element={<RecipesPage />} />
                    <Route path="resources" element={<ResourcesPage />} />
                    <Route path="chat" element={<ChatPage currentUser={currentUser} />} />
                </>
            )}

            {/* Trainer Routes */}
            {currentUser.role === UserRole.TRAINER && (
                 <>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<DashboardPage currentUser={currentUser} />} />
                    <Route path="client/:clientId/*" element={<ClientRoutes currentUser={currentUser} />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
            )}

          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </HashRouter>
  );
};

interface ClientRoutesProps {
    currentUser: User;
}

const ClientRoutes: React.FC<ClientRoutesProps> = ({ currentUser }) => {
    const { clientId } = useParams<{ clientId: string }>();
    const [client, setClient] = useState<User | null>(null);
    const [loadingClient, setLoadingClient] = useState<boolean>(true);

    useEffect(() => {
        const fetchClient = async () => {
            if (clientId) {
                try {
                    const response = await clients.getClientById(clientId);
                    setClient(response.data.data);
                } catch (error) {
                    console.error(`Error fetching client ${clientId}:`, error);
                    setClient(null);
                }
            }
            setLoadingClient(false);
        };
        fetchClient();
    }, [clientId]);

    if (loadingClient) {
        return <div className="text-center p-8">Cargando información del cliente...</div>;
    }

    if (!clientId) {
        return <div className="text-center p-8">No se ha especificado un ID de cliente.</div>;
    }

    if (!client) {
        return <div className="text-center p-8 text-red-500">Error: Cliente con ID "{clientId}" no encontrado o no autorizado.</div>;
    }

    const userId = client._id || client.id;
    
    if (!userId) {
        return <div className="text-center p-8 text-red-500">Error: ID de cliente no válido.</div>;
    }

    return (
        <Routes>
            <Route path="dashboard" element={<DashboardPage currentUser={client} isTrainerContext={true} />} />
            <Route path="diet" element={<DietPage userId={userId} isTrainerContext={true} />} />
            <Route path="workout" element={<WorkoutPage userId={userId} isTrainerContext={true} />} />
            <Route path="tracking" element={<TrackingPage userId={userId} isTrainerContext={true} />} />
            <Route path="chat" element={<ChatPage currentUser={currentUser} selectedClient={client} />} />
        </Routes>
    );
};

export default App;

