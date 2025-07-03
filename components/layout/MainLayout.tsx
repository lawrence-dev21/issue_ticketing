
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { APP_TITLE } from '../../constants';
import { LayoutDashboardIcon, UsersIcon, TicketIcon, LogOutIcon } from '../icons/LucideIcons';


const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2.5 rounded-lg text-gray-200 hover:bg-ministry-blue hover:text-white transition-colors duration-200 ${isActive ? 'bg-ministry-blue text-white font-semibold' : ''}`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  );
};

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // Or a loading spinner, though ProtectedRoute should handle this
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-2 shadow-lg">
        
         <img src="../assets/logo.png" alt="Ministry Logo" className="mx-auto mb-2 h-24 object-cover bg-white rounded-3xl"/>
        <div className="text-2xl font-bold text-ministry-gold mb-6 text-center">{APP_TITLE.split(" ").slice(0,3).join(" ")}</div>
        <nav className="flex-grow">
          {user.role === UserRole.ADMIN && (
            <>
              <SidebarLink to="/admin/dashboard" icon={<LayoutDashboardIcon size={20} />}>Dashboard</SidebarLink>
              <SidebarLink to="/admin/users" icon={<UsersIcon size={20} />}>User Management</SidebarLink>
            </>
          )}
          {user.role === UserRole.OFFICER && (
            <SidebarLink to="/officer/dashboard" icon={<TicketIcon size={20} />}>My Tickets</SidebarLink>
          )}
        </nav>
        <div className="mt-auto">
           <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 rounded-lg text-gray-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
          >
            <LogOutIcon size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-700">
              {/* Dynamically set header based on route or keep it generic */}
              {user.role === UserRole.ADMIN ? 'Admin Portal' : 'Officer Portal'}
            </h1>
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium text-ministry-blue">{user.name}</span> ({user.role})
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* This is where nested route components will render */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
