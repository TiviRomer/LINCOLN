import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLogo from '../../Logo/DashboardLogo';
import './Header.scss';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  notificationCount: number;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, notificationCount, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <DashboardLogo size="medium" />
        <nav className="breadcrumbs">
          <span className="breadcrumb-item">Dashboard</span>
        </nav>
      </div>

      <div className="header-center">
        <div className="search-container">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar servidores, amenazas, incidentes..."
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-icon-button"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Notificaciones"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
          )}
        </button>

        <button
          className="header-icon-button"
          onClick={() => navigate('/settings')}
          aria-label="Configuración"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.364-6.364-4.243 4.243m0 0-4.243 4.243m4.243-4.243L12 8.586m4.243 4.243L20.364 4.636M12 8.586 8.586 12m0 0-4.243 4.243M8.586 12 4.343 7.757m0 9.9 4.243-4.243M8.586 12l3.414 3.414"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          className="header-icon-button"
          onClick={() => navigate('/help')}
          aria-label="Ayuda"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m0 4h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="profile-menu-container">
          <button
            className="profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Menú de perfil"
          >
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user.name}</span>
              <span className="profile-role">{user.role}</span>
            </div>
            <svg
              className={`profile-arrow ${showProfileMenu ? 'open' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showProfileMenu && (
            <>
              <div className="profile-menu-overlay" onClick={() => setShowProfileMenu(false)} />
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-avatar large">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="profile-name">{user.name}</div>
                    <div className="profile-email">{user.email}</div>
                    <div className="profile-role">{user.role}</div>
                  </div>
                </div>
                <div className="profile-menu-divider" />
                <button className="profile-menu-item" onClick={() => navigate('/profile')}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Mi Perfil
                </button>
                <button className="profile-menu-item" onClick={() => navigate('/settings')}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.364-6.364-4.243 4.243m0 0-4.243 4.243m4.243-4.243L12 8.586m4.243 4.243L20.364 4.636M12 8.586 8.586 12m0 0-4.243 4.243M8.586 12 4.343 7.757m0 9.9 4.243-4.243M8.586 12l3.414 3.414"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Configuración
                </button>
                <button className="profile-menu-item" onClick={() => navigate('/sessions')}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M7 11V7a5 5 0 0 1 10 0v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Sesiones Activas
                </button>
                <div className="profile-menu-divider" />
                <button className="profile-menu-item logout" onClick={onLogout}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

