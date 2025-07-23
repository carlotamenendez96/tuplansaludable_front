import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, UserRole } from '../../types';
import { HomeIcon, AppleIcon, DumbbellIcon, BarChartIcon, BookOpenIcon, MessageSquareIcon, LogOutIcon, UsersIcon, ChefHatIcon } from '../ui/Icons';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  onClientSelect?: (client: User) => void;
  clients?: User[];
  selectedClient?: User | null;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-white'
          : 'text-text-muted hover:bg-base-200 hover:text-text-base'
      }`
    }
  >
    {icon}
    <span className="ml-4">{label}</span>
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, onClientSelect, clients = [], selectedClient }) => {
  const isTrainer = user.role === UserRole.TRAINER;

  const userNavItems = [
    { to: '/dashboard', icon: <HomeIcon className="w-6 h-6" />, label: 'Dashboard' },
    { to: '/diet', icon: <AppleIcon className="w-6 h-6" />, label: 'Plan de Comida' },
    { to: '/workout', icon: <DumbbellIcon className="w-6 h-6" />, label: 'Entrenamiento' },
    { to: '/tracking', icon: <BarChartIcon className="w-6 h-6" />, label: 'Seguimiento' },
    { to: '/recipes', icon: <ChefHatIcon className="w-6 h-6" />, label: 'Recetas' },
    { to: '/resources', icon: <BookOpenIcon className="w-6 h-6" />, label: 'Recursos' },
    { to: '/chat', icon: <MessageSquareIcon className="w-6 h-6" />, label: 'Chat' },
  ];

  const trainerNavItems = [
     { to: '/dashboard', icon: <UsersIcon className="w-6 h-6" />, label: 'Mis Clientes' },
  ];
  
  const navItems = isTrainer ? trainerNavItems : userNavItems;

  return (
    <aside className="w-72 bg-white flex flex-col h-screen p-4 border-r border-base-200 shadow-sm fixed">
      <div className="flex items-center mb-8 px-2">
        <div className="bg-primary p-2 rounded-full">
            <AppleIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold ml-3 text-primary">Tu Plan Saludable</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map(item => <NavItem key={item.to} {...item} />)}
        
        {isTrainer && (
          <div className="px-4 pt-4">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Clientes</h3>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {clients.map(client => (
                <li key={client.id}>
                  <button
                    onClick={() => onClientSelect && onClientSelect(client)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedClient?.id === client.id ? 'bg-secondary/20 text-secondary font-semibold' : 'hover:bg-base-200'}`}
                  >
                    {client.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isTrainer && selectedClient && (
          <div className="px-4 pt-4 border-t border-base-200 mt-4">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
              Plan de {selectedClient.name.split(' ')[0]}
            </h3>
            <div className="space-y-1">
                <NavItem to={`/client/${selectedClient.id}/dashboard`} icon={<HomeIcon className="w-5 h-5" />} label="Dashboard" />
                <NavItem to={`/client/${selectedClient.id}/diet`} icon={<AppleIcon className="w-5 h-5" />} label="Plan Comida" />
                <NavItem to={`/client/${selectedClient.id}/workout`} icon={<DumbbellIcon className="w-5 h-5" />} label="Entrenamiento" />
                <NavItem to={`/client/${selectedClient.id}/tracking`} icon={<BarChartIcon className="w-5 h-5" />} label="Seguimiento" />
                <NavItem to={`/client/${selectedClient.id}/chat`} icon={<MessageSquareIcon className="w-5 h-5" />} label="Chat" />
            </div>
          </div>
        )}

      </nav>
      <div className="mt-auto">
        <div className="p-4 border-t border-base-200">
          <p className="font-semibold text-text-base">{user.name}</p>
          <p className="text-sm text-text-muted">{isTrainer ? 'Entrenador' : 'Usuario'}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 text-lg font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOutIcon className="w-6 h-6" />
          <span className="ml-4">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;