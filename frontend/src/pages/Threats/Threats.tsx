import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import { Alert, Threat, ThreatSeverity, ThreatType, AlertStatus } from '../../types/dashboard';
import firestoreService from '../../services/firestore.service';
import './Threats.scss';

const Threats: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  // Estados
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'threats' | 'alerts'>('alerts');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<ThreatSeverity | 'all'>('all');
  const [filterType, setFilterType] = useState<ThreatType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');
  const [filterServer, setFilterServer] = useState<string>('all');
  
  // Detalles
  const [selectedItem, setSelectedItem] = useState<Alert | Threat | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // User data
  const user = {
    name: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario',
    email: currentUser?.email || '',
    role: userProfile?.role || 'user',
    avatar: currentUser?.photoURL || undefined,
  };

  // Cargar datos en tiempo real
  useEffect(() => {
    console.log('🔄 Cargando amenazas y alertas...');
    let mounted = true;

    const unsubscribeAlerts = firestoreService.alerts.onAlertsChange((newAlerts) => {
      if (mounted) {
        console.log(`📡 Alertas actualizadas: ${newAlerts.length}`);
        setAlerts(newAlerts);
        setLoading(false);
      }
    });

    const unsubscribeThreats = firestoreService.threats.onThreatsChange((newThreats) => {
      if (mounted) {
        console.log(`📡 Amenazas actualizadas: ${newThreats.length}`);
        setThreats(newThreats);
      }
    });

    return () => {
      mounted = false;
      unsubscribeAlerts();
      unsubscribeThreats();
    };
  }, []);

  // Filtrar alertas
  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.serverName.toLowerCase().includes(term)
      );
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter((a) => a.severity === filterSeverity);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    if (filterServer !== 'all') {
      filtered = filtered.filter((a) => a.serverId === filterServer);
    }

    // Ordenar por severidad y fecha (críticas primero, luego por fecha)
    filtered.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, filterSeverity, filterType, filterStatus, filterServer]);

  // Filtrar amenazas
  useEffect(() => {
    let filtered = threats;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.serverName.toLowerCase().includes(term)
      );
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter((t) => t.severity === filterSeverity);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterServer !== 'all') {
      filtered = filtered.filter((t) => t.serverId === filterServer);
    }

    // Ordenar por severidad y fecha
    filtered.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredThreats(filtered);
  }, [threats, searchTerm, filterSeverity, filterType, filterServer]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getSeverityColor = (severity: ThreatSeverity): string => {
    switch (severity) {
      case 'critical':
        return '#ff4444';
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#ffd93d';
      default:
        return '#00d4ff';
    }
  };

  const getTypeLabel = (type: ThreatType): string => {
    switch (type) {
      case 'ransomware':
        return 'Ransomware';
      case 'intrusion':
        return 'Intrusión';
      case 'data_leak':
        return 'Filtración de Datos';
      case 'anomalous_behavior':
        return 'Comportamiento Anómalo';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: ThreatType) => {
    switch (type) {
      case 'ransomware':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'intrusion':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'data_leak':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'anomalous_behavior':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
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

  const handleViewDetails = (item: Alert | Threat) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleAlertAction = {
    acknowledge: async (id: string) => {
      try {
        await firestoreService.alerts.updateStatus(id, 'acknowledged');
        console.log('✅ Alerta reconocida:', id);
      } catch (error) {
        console.error('❌ Error al reconocer alerta:', error);
      }
    },
    investigate: async (id: string) => {
      try {
        const alert = alerts.find((a) => a.id === id);
        if (alert) {
          const incidentId = await firestoreService.incidents.createFromAlert(id, alert, user.name);
          console.log('✅ Incidente creado desde alerta:', incidentId);
          navigate(`/incidents?incident=${incidentId}`);
        }
      } catch (error) {
        console.error('❌ Error al crear incidente desde alerta:', error);
        alert('Error al crear incidente. Por favor, intenta nuevamente.');
      }
    },
    resolve: async (id: string) => {
      try {
        await firestoreService.alerts.updateStatus(id, 'resolved');
        console.log('✅ Alerta resuelta:', id);
      } catch (error) {
        console.error('❌ Error al resolver alerta:', error);
      }
    },
    escalate: async (id: string) => {
      try {
        await firestoreService.alerts.updateStatus(id, 'escalated');
        console.log('⬆️ Alerta escalada:', id);
      } catch (error) {
        console.error('❌ Error al escalar alerta:', error);
      }
    },
  };

  // Estadísticas
  const stats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a) => a.status === 'active').length,
    criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
    totalThreats: threats.length,
    criticalThreats: threats.filter((t) => t.severity === 'critical').length,
    resolvedToday: alerts.filter((a) => {
      if (a.status !== 'resolved') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return a.timestamp >= today;
    }).length,
  };

  // Obtener servidores únicos
  const servers = Array.from(
    new Set([...alerts.map((a) => a.serverId), ...threats.map((t) => t.serverId)])
  );

  if (loading) {
    return (
      <div className="threats-container dark">
        <div className="loading-screen">
          <div className="spinner" />
          <p>Cargando Amenazas y Alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="threats-container dark">
      <Header
        user={user}
        notificationCount={stats.activeAlerts}
        onLogout={handleLogout}
      />
      <div className="threats-content">
        <Sidebar userRole={user.role} />
        <main className="threats-main">
          {/* Header de la página */}
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Threats & Alerts</h1>
              <p className="page-subtitle">Monitoreo y gestión de amenazas de seguridad</p>
            </div>
            <div className="header-actions">
              <div className="live-indicator">
                <span className="live-dot" />
                Monitoreo en Tiempo Real
              </div>
              <button className="btn-secondary" onClick={() => navigate('/incidents')}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Ver Incidentes
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="stats-cards">
            <div className="stat-card critical">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.criticalAlerts}</div>
                <div className="stat-label">Alertas Críticas</div>
              </div>
            </div>

            <div className="stat-card active">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeAlerts}</div>
                <div className="stat-label">Alertas Activas</div>
              </div>
            </div>

            <div className="stat-card total">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalAlerts}</div>
                <div className="stat-label">Total Alertas</div>
              </div>
            </div>

            <div className="stat-card threats">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalThreats}</div>
                <div className="stat-label">Amenazas Detectadas</div>
              </div>
            </div>

            <div className="stat-card resolved">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.resolvedToday}</div>
                <div className="stat-label">Resueltas Hoy</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Alertas ({stats.totalAlerts})
            </button>
            <button
              className={`tab ${activeTab === 'threats' ? 'active' : ''}`}
              onClick={() => setActiveTab('threats')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Amenazas ({stats.totalThreats})
            </button>
          </div>

          {/* Controles y filtros */}
          <div className="controls-bar">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por título, descripción o servidor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as ThreatSeverity | 'all')}
              >
                <option value="all">Todas las Severidades</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ThreatType | 'all')}
              >
                <option value="all">Todos los Tipos</option>
                <option value="ransomware">Ransomware</option>
                <option value="intrusion">Intrusión</option>
                <option value="data_leak">Filtración de Datos</option>
                <option value="anomalous_behavior">Comportamiento Anómalo</option>
              </select>

              {activeTab === 'alerts' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AlertStatus | 'all')}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Activa</option>
                  <option value="acknowledged">Reconocida</option>
                  <option value="resolved">Resuelta</option>
                  <option value="escalated">Escalada</option>
                </select>
              )}

              {servers.length > 0 && (
                <select value={filterServer} onChange={(e) => setFilterServer(e.target.value)}>
                  <option value="all">Todos los Servidores</option>
                  {servers.map((serverId) => {
                    const serverName = alerts.find((a) => a.serverId === serverId)?.serverName ||
                                      threats.find((t) => t.serverId === serverId)?.serverName ||
                                      serverId;
                    return (
                      <option key={serverId} value={serverId}>
                        {serverName}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          </div>

          {/* Contenido según tab activo */}
          {activeTab === 'alerts' ? (
            <div className="alerts-section">
              {filteredAlerts.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3>No se encontraron alertas</h3>
                  <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="alerts-list">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="alert-card" data-severity={alert.severity} data-status={alert.status}>
                      <div className="alert-severity-bar" style={{ backgroundColor: getSeverityColor(alert.severity) }} />
                      
                      <div className="alert-main">
                        <div className="alert-header">
                          <div className="alert-type-icon">
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="alert-title-section">
                            <h3 className="alert-title">{alert.title}</h3>
                            <div className="alert-meta">
                              <span className="alert-type">{getTypeLabel(alert.type)}</span>
                              <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="alert-status">{alert.status}</span>
                            </div>
                          </div>
                        </div>

                        <p className="alert-description">{alert.description}</p>

                        <div className="alert-footer">
                          <div className="alert-info">
                            <span className="alert-server">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              {alert.serverName}
                            </span>
                            <span className="alert-time">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              {formatTime(alert.timestamp)}
                            </span>
                          </div>

                          <div className="alert-actions">
                            <button className="action-btn" onClick={() => handleViewDetails(alert)} title="Ver detalles">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </button>
                            {alert.status === 'active' && (
                              <button className="action-btn" onClick={() => handleAlertAction.acknowledge(alert.id)} title="Reconocer">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            )}
                            <button className="action-btn primary" onClick={() => handleAlertAction.investigate(alert.id)} title="Investigar">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </button>
                            {alert.status === 'acknowledged' && (
                              <button className="action-btn success" onClick={() => handleAlertAction.resolve(alert.id)} title="Resolver">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            )}
                            <button className="action-btn warning" onClick={() => handleAlertAction.escalate(alert.id)} title="Escalar">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="18 15 12 9 6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="threats-section">
              {filteredThreats.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3>No se encontraron amenazas</h3>
                  <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="threats-timeline">
                  <div className="timeline-line" />
                  <div className="threats-list">
                    {filteredThreats.map((threat) => (
                      <div key={threat.id} className="threat-item" data-severity={threat.severity}>
                        <div className="threat-marker" style={{ backgroundColor: getSeverityColor(threat.severity) }} />
                        <div className="threat-content">
                          <div className="threat-header">
                            <div className="threat-type-icon">
                              {getTypeIcon(threat.type)}
                            </div>
                            <div className="threat-info">
                              <span className="threat-type">{getTypeLabel(threat.type)}</span>
                              <span className="threat-severity" style={{ color: getSeverityColor(threat.severity) }}>
                                {threat.severity.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="threat-description">{threat.description}</p>
                          <div className="threat-footer">
                            <div className="threat-meta">
                              <span className="threat-server">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {threat.serverName}
                              </span>
                              <span className="threat-time">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                  <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {formatTime(threat.timestamp)}
                              </span>
                            </div>
                            <button className="action-btn" onClick={() => handleViewDetails(threat)} title="Ver detalles">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal de detalles */}
      {showDetailsModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{'title' in selectedItem ? selectedItem.title : getTypeLabel(selectedItem.type)}</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Información General</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tipo</span>
                    <span className="detail-value">{getTypeLabel(selectedItem.type)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Severidad</span>
                    <span className="detail-value" style={{ color: getSeverityColor(selectedItem.severity) }}>
                      {selectedItem.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Servidor</span>
                    <span className="detail-value">{selectedItem.serverName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha y Hora</span>
                    <span className="detail-value">
                      {new Intl.DateTimeFormat('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(selectedItem.timestamp)}
                    </span>
                  </div>
                  {'status' in selectedItem && (
                    <div className="detail-item">
                      <span className="detail-label">Estado</span>
                      <span className="detail-value">{selectedItem.status}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="detail-section">
                <h3>Descripción</h3>
                <p className="detail-description">{selectedItem.description}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Cerrar
              </button>
              {'id' in selectedItem && 'status' in selectedItem && selectedItem.status === 'active' && (
                <button className="btn-primary" onClick={() => {
                  handleAlertAction.investigate(selectedItem.id);
                  setShowDetailsModal(false);
                }}>
                  Investigar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Threats;

