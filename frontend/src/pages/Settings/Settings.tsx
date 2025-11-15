import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import './Settings.scss';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'general');
  const [loading, setLoading] = useState(false);

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

  const handleSave = () => {
    setLoading(true);
    // TODO: Implementar guardado de configuración
    setTimeout(() => {
      setLoading(false);
      console.log('Configuración guardada');
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'alerts', label: 'Alertas', icon: '🔔' },
    { id: 'notifications', label: 'Notificaciones', icon: '📧' },
    { id: 'security', label: 'Seguridad', icon: '🔒' },
    { id: 'integrations', label: 'Integraciones', icon: '🔌' },
  ];

  return (
    <div className="settings-container dark">
      <Header
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />
      <div className="settings-content">
        <Sidebar userRole={user.role} />
        <main className="settings-main">
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Configuración</h1>
              <p className="page-subtitle">Gestiona las preferencias y configuraciones del sistema</p>
            </div>
          </div>

          <div className="settings-layout">
            <div className="settings-sidebar">
              <nav className="settings-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="settings-panel">
              {activeTab === 'general' && (
                <div className="settings-section">
                  <h2 className="section-title">Configuración General</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label className="form-label">Idioma</label>
                      <select className="form-select">
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Zona Horaria</label>
                      <select className="form-select">
                        <option value="UTC-5">UTC-5 (Colombia, Perú)</option>
                        <option value="UTC-3">UTC-3 (Argentina, Chile)</option>
                        <option value="UTC-6">UTC-6 (México)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tema</label>
                      <div className="theme-options">
                        <button className="theme-option active">
                          <div className="theme-preview dark-theme"></div>
                          <span>Oscuro</span>
                        </button>
                        <button className="theme-option">
                          <div className="theme-preview light-theme"></div>
                          <span>Claro</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="settings-section">
                  <h2 className="section-title">Configuración de Alertas</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label className="form-label checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Alertas críticas por email</span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="form-label checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Notificaciones push en tiempo real</span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Umbral de Severidad</label>
                      <select className="form-select">
                        <option value="low">Baja y superior</option>
                        <option value="medium">Media y superior</option>
                        <option value="high">Alta y superior</option>
                        <option value="critical">Solo críticas</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h2 className="section-title">Notificaciones</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label className="form-label">Email de Notificaciones</label>
                      <input type="email" className="form-input" defaultValue={user.email} />
                    </div>
                    <div className="form-group">
                      <label className="form-label checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Notificaciones de incidentes</span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="form-label checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Resúmenes diarios</span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="form-label checkbox-label">
                        <input type="checkbox" />
                        <span>Resúmenes semanales</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <h2 className="section-title">Seguridad</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label className="form-label">Cambiar Contraseña</label>
                      <div className="password-change">
                        <input type="password" className="form-input" placeholder="Nueva contraseña" />
                        <input type="password" className="form-input" placeholder="Confirmar contraseña" />
                        <button className="btn-secondary">Actualizar Contraseña</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Autenticación de dos factores (2FA)</span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tiempo de Sesión</label>
                      <select className="form-select">
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="60">1 hora</option>
                        <option value="120">2 horas</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="settings-section">
                  <h2 className="section-title">Integraciones</h2>
                  <div className="integrations-list">
                    <div className="integration-item">
                      <div className="integration-info">
                        <h3>Slack</h3>
                        <p>Recibe alertas en tiempo real en Slack</p>
                      </div>
                      <button className="btn-secondary">Configurar</button>
                    </div>
                    <div className="integration-item">
                      <div className="integration-info">
                        <h3>Microsoft Teams</h3>
                        <p>Integra alertas con Microsoft Teams</p>
                      </div>
                      <button className="btn-secondary">Configurar</button>
                    </div>
                    <div className="integration-item">
                      <div className="integration-info">
                        <h3>Webhook</h3>
                        <p>Configura webhooks personalizados</p>
                      </div>
                      <button className="btn-secondary">Configurar</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="settings-actions">
                <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;

