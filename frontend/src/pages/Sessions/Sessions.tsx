import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import './Sessions.scss';

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  const [sessions, setSessions] = useState([
    {
      id: '1',
      device: 'Windows 10 - Chrome',
      location: 'Bogotá, Colombia',
      ip: '192.168.1.100',
      lastActivity: new Date('2025-01-15T10:30:00'),
      current: true,
    },
    {
      id: '2',
      device: 'macOS - Safari',
      location: 'Medellín, Colombia',
      ip: '192.168.1.101',
      lastActivity: new Date('2025-01-14T15:20:00'),
      current: false,
    },
    {
      id: '3',
      device: 'Android - Chrome Mobile',
      location: 'Cali, Colombia',
      ip: '192.168.1.102',
      lastActivity: new Date('2025-01-13T08:15:00'),
      current: false,
    },
  ]);

  const user = {
    name: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario',
    email: currentUser?.email || '',
    role: userProfile?.role || 'user',
    avatar: currentUser?.photoURL || undefined,
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    if (window.confirm('¿Estás seguro de que deseas terminar esta sesión?')) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      console.log('Sesión terminada:', sessionId);
    }
  };

  const handleTerminateAll = () => {
    if (window.confirm('¿Estás seguro de que deseas terminar todas las demás sesiones?')) {
      setSessions(sessions.filter(s => s.current));
      console.log('Todas las sesiones terminadas');
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="sessions-container dark">
      <Header
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />
      <div className="sessions-content">
        <Sidebar userRole={user.role} />
        <main className="sessions-main">
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Sesiones Activas</h1>
              <p className="page-subtitle">Gestiona y monitorea tus sesiones activas en el sistema</p>
            </div>
            {sessions.filter(s => !s.current).length > 0 && (
              <button className="btn-danger" onClick={handleTerminateAll}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Terminar Todas las Otras Sesiones
              </button>
            )}
          </div>

          <div className="sessions-info-card">
            <div className="info-item">
              <div className="info-label">Sesiones Activas</div>
              <div className="info-value">{sessions.length}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Dispositivos</div>
              <div className="info-value">{new Set(sessions.map(s => s.device.split(' - ')[0])).size}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Última Actividad</div>
              <div className="info-value">{formatTime(sessions[0].lastActivity)}</div>
            </div>
          </div>

          <div className="sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className={`session-card ${session.current ? 'current' : ''}`}>
                <div className="session-main">
                  <div className="session-icon">
                    {session.device.includes('Windows') && '🪟'}
                    {session.device.includes('macOS') && '🍎'}
                    {session.device.includes('Android') && '📱'}
                    {session.device.includes('iOS') && '📱'}
                    {!session.device.includes('Windows') && !session.device.includes('macOS') && 
                     !session.device.includes('Android') && !session.device.includes('iOS') && '💻'}
                  </div>
                  <div className="session-info">
                    <div className="session-header">
                      <h3 className="session-device">{session.device}</h3>
                      {session.current && (
                        <span className="current-badge">Sesión Actual</span>
                      )}
                    </div>
                    <div className="session-details">
                      <div className="session-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span>{session.location}</span>
                      </div>
                      <div className="session-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span>{session.ip}</span>
                      </div>
                      <div className="session-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Última actividad: {formatTime(session.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button
                    className="terminate-btn"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Terminar Sesión
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="security-tips">
            <h3 className="tips-title">💡 Consejos de Seguridad</h3>
            <ul className="tips-list">
              <li>Revisa regularmente tus sesiones activas para detectar accesos no autorizados</li>
              <li>Termina sesiones en dispositivos que ya no uses</li>
              <li>Si detectas actividad sospechosa, cambia tu contraseña inmediatamente</li>
              <li>Usa autenticación de dos factores para mayor seguridad</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sessions;

