import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import { Incident, IncidentStatus, ThreatSeverity, ThreatType, IncidentTimelineEvent } from '../../types/dashboard';
import firestoreService from '../../services/firestore.service';
import './Incidents.scss';

const Incidents: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile, logout } = useAuth();
  
  // Estados
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref para rastrear si el componente está montado (para usar en callbacks)
  const isMountedRef = useRef(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<ThreatSeverity | 'all'>('all');
  const [filterType, setFilterType] = useState<ThreatType | 'all'>('all');
  
  // Detalles
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // User data
  const user = {
    name: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario',
    email: currentUser?.email || '',
    role: userProfile?.role || 'user',
    avatar: currentUser?.photoURL || undefined,
  };

  // Datos de demostración para presentación
  const getDemoIncidents = (): Incident[] => {
    const now = new Date();
    return [
      {
        id: 'demo-1',
        title: 'Intento de Ransomware Detectado en Servidor Principal',
        type: 'ransomware',
        severity: 'critical',
        status: 'investigating',
        affectedServers: ['server-001', 'server-002'],
        detectedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Hace 2 horas
        automatedResponses: [
          'Proceso sospechoso bloqueado automáticamente',
          'Conexiones de red del proceso terminadas',
          'Backup de seguridad activado',
        ],
        manualActions: [
          'Análisis forense iniciado por el equipo de seguridad',
          'Notificación enviada al administrador del sistema',
        ],
        timeline: [
          {
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            action: 'detected',
            actor: 'system',
            description: 'Patrón de encriptación sospechoso detectado en archivos del sistema',
          },
          {
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
            action: 'automated_response',
            actor: 'system',
            description: 'Proceso bloqueado y aislado automáticamente',
          },
          {
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            action: 'investigating',
            actor: user.name,
            description: 'Investigación manual iniciada por el equipo de seguridad',
          },
        ],
      },
      {
        id: 'demo-2',
        title: 'Intrusión Detectada: Múltiples Intentos de Acceso No Autorizado',
        type: 'intrusion',
        severity: 'high',
        status: 'contained',
        affectedServers: ['server-003'],
        detectedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // Hace 6 horas
        resolvedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Resuelto hace 1 hora
        automatedResponses: [
          'IP bloqueada automáticamente',
          'Firewall actualizado con nueva regla',
          'Logs de acceso guardados para análisis',
        ],
        manualActions: [
          'Revisión de permisos de usuario completada',
          'Credenciales comprometidas revocadas',
        ],
        timeline: [
          {
            timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
            action: 'detected',
            actor: 'system',
            description: 'Múltiples intentos de login fallidos desde IP externa',
          },
          {
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
            action: 'investigating',
            actor: user.name,
            description: 'Análisis de logs de acceso iniciado',
          },
          {
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            action: 'contained',
            actor: user.name,
            description: 'Amenaza contenida, IP bloqueada permanentemente',
          },
          {
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            action: 'resolved',
            actor: user.name,
            description: 'Incidente resuelto, sistema seguro',
          },
        ],
      },
      {
        id: 'demo-3',
        title: 'Filtración de Datos Sensibles Prevenida',
        type: 'data_leak',
        severity: 'medium',
        status: 'resolved',
        affectedServers: ['server-004'],
        detectedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Hace 1 día
        resolvedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // Resuelto hace 12 horas
        automatedResponses: [
          'Transferencia de archivos bloqueada',
          'Usuario notificado del intento',
          'Política de seguridad aplicada',
        ],
        manualActions: [
          'Revisión de políticas de acceso completada',
          'Capacitación adicional proporcionada al usuario',
        ],
        timeline: [
          {
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            action: 'detected',
            actor: 'system',
            description: 'Intento de transferir archivos confidenciales detectado',
          },
          {
            timestamp: new Date(now.getTime() - 23 * 60 * 60 * 1000),
            action: 'automated_response',
            actor: 'system',
            description: 'Transferencia bloqueada automáticamente',
          },
          {
            timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
            action: 'resolved',
            actor: user.name,
            description: 'Políticas actualizadas, incidente resuelto',
          },
        ],
      },
      {
        id: 'demo-4',
        title: 'Comportamiento Anómalo en Procesos del Sistema',
        type: 'anomalous_behavior',
        severity: 'low',
        status: 'active',
        affectedServers: ['server-005'],
        detectedAt: new Date(now.getTime() - 30 * 60 * 1000), // Hace 30 minutos
        automatedResponses: [
          'Monitoreo adicional activado',
          'Análisis de comportamiento iniciado',
        ],
        manualActions: [],
        timeline: [
          {
            timestamp: new Date(now.getTime() - 30 * 60 * 1000),
            action: 'detected',
            actor: 'system',
            description: 'Uso inusual de recursos del sistema detectado',
          },
        ],
      },
    ];
  };

  // Cargar incidentes en tiempo real desde Firestore
  useEffect(() => {
    console.log('🔄 Cargando incidentes desde Firestore...');
    isMountedRef.current = true;
    let unsubscribe: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    setLoading(true);

    // Timeout de seguridad para evitar carga infinita
    timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        console.warn('⚠️ Timeout al cargar incidentes, usando datos de demostración');
        setIncidents(getDemoIncidents());
        setLoading(false);
      }
    }, 5000);

    try {
      unsubscribe = firestoreService.incidents.onIncidentsChange(
        (newIncidents) => {
          if (isMountedRef.current) {
            console.log(`📡 Incidentes actualizados: ${newIncidents.length}`);
            if (newIncidents.length > 0) {
              setIncidents(newIncidents);
            } else {
              setIncidents(getDemoIncidents());
            }
            setLoading(false);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          }
        },
        (error) => {
          console.error('❌ Error al cargar incidentes:', error);
          if (isMountedRef.current) {
            setIncidents(getDemoIncidents());
            setLoading(false);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          }
        }
      );
    } catch (error) {
      console.error('❌ Error al suscribirse a incidentes:', error);
      if (isMountedRef.current) {
        setIncidents(getDemoIncidents());
        setLoading(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    }

    return () => {
      isMountedRef.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (unsubscribe) {
        unsubscribe();
        console.log('🔄 Listener de incidentes desconectado');
      }
    };
  }, []);

  // Filtrar incidentes
  useEffect(() => {
    let filtered = incidents;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          i.type.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((i) => i.status === filterStatus);
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter((i) => i.severity === filterSeverity);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((i) => i.type === filterType);
    }

    // Ordenar por severidad y fecha (críticos primero, luego por fecha)
    filtered.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.detectedAt.getTime() - a.detectedAt.getTime();
    });

    setFilteredIncidents(filtered);
  }, [incidents, searchTerm, filterStatus, filterSeverity, filterType]);

  // Verificar si hay incidente desde URL
  useEffect(() => {
    const incidentId = searchParams.get('incident');
    if (incidentId) {
      if (incidents.length > 0) {
        const incident = incidents.find((i) => i.id === incidentId);
        if (incident) {
          setSelectedIncident(incident);
          setShowDetailsModal(true);
        }
      } else {
        // Si aún no hay incidentes cargados, intentar cargar el específico
        firestoreService.incidents.getById(incidentId).then((incident) => {
          if (incident) {
            setSelectedIncident(incident);
            setShowDetailsModal(true);
          }
        });
      }
    }
  }, [searchParams, incidents]);

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

  const getStatusColor = (status: IncidentStatus): string => {
    switch (status) {
      case 'active':
        return '#ff4444';
      case 'investigating':
        return '#ffaa00';
      case 'contained':
        return '#00d4ff';
      case 'resolved':
        return '#00ff88';
      default:
        return '#00d4ff';
    }
  };

  const getStatusLabel = (status: IncidentStatus): string => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'investigating':
        return 'En Investigación';
      case 'contained':
        return 'Contenido';
      case 'resolved':
        return 'Resuelto';
      default:
        return status;
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
          </svg>
        );
      case 'intrusion':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

  const calculateResponseTime = (incident: Incident): string => {
    if (incident.resolvedAt) {
      const diff = incident.resolvedAt.getTime() - incident.detectedAt.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      return `${minutes}m`;
    }
    return 'En curso';
  };

  const handleViewDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowDetailsModal(true);
  };

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      const description = `Estado cambiado a ${getStatusLabel(newStatus)}`;
      await firestoreService.incidents.updateStatus(incidentId, newStatus, user.name, description);
      console.log(`✅ Estado del incidente ${incidentId} cambiado a ${newStatus}`);
    } catch (error) {
      console.error('❌ Error al actualizar estado del incidente:', error);
      alert('Error al actualizar el estado del incidente. Por favor, intenta nuevamente.');
    }
  };

  // Estadísticas
  const stats = {
    total: incidents.length,
    active: incidents.filter((i) => i.status === 'active').length,
    investigating: incidents.filter((i) => i.status === 'investigating').length,
    contained: incidents.filter((i) => i.status === 'contained').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
    critical: incidents.filter((i) => i.severity === 'critical').length,
    avgResponseTime: incidents
      .filter((i) => i.resolvedAt)
      .reduce((acc, i) => {
        if (i.resolvedAt) {
          const diff = i.resolvedAt.getTime() - i.detectedAt.getTime();
          return acc + diff;
        }
        return acc;
      }, 0) / incidents.filter((i) => i.resolvedAt).length || 0,
  };

  if (loading) {
    return (
      <div className="incidents-container dark">
        <Header
          user={user}
          notificationCount={0}
          onLogout={handleLogout}
        />
        <div className="incidents-content">
          <Sidebar userRole={user.role} />
          <div className="loading-screen">
            <div className="spinner" />
            <p>Cargando Incidentes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="incidents-container dark">
      <Header
        user={user}
        notificationCount={stats.active}
        onLogout={handleLogout}
      />
      <div className="incidents-content">
        <Sidebar userRole={user.role} />
        <main className="incidents-main">
          {/* Header de la página */}
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Centro de Respuesta a Incidentes</h1>
              <p className="page-subtitle">Gestión y seguimiento de incidentes de seguridad</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/threats')}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ver Alertas
            </button>
          </div>

          {/* Estadísticas */}
          <div className="stats-cards">
            <div className="stat-card total">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Incidentes</div>
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
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Activos</div>
              </div>
            </div>

            <div className="stat-card investigating">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.investigating}</div>
                <div className="stat-label">En Investigación</div>
              </div>
            </div>

            <div className="stat-card contained">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.contained}</div>
                <div className="stat-label">Contenidos</div>
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
                <div className="stat-value">{stats.resolved}</div>
                <div className="stat-label">Resueltos</div>
              </div>
            </div>

            <div className="stat-card critical">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.critical}</div>
                <div className="stat-label">Críticos</div>
              </div>
            </div>
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
                placeholder="Buscar incidentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | 'all')}
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Activo</option>
                <option value="investigating">En Investigación</option>
                <option value="contained">Contenido</option>
                <option value="resolved">Resuelto</option>
              </select>

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

              <div className="view-toggle">
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  className={viewMode === 'timeline' ? 'active' : ''}
                  onClick={() => setViewMode('timeline')}
                  title="Vista de timeline"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de incidentes */}
          {filteredIncidents.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>No se encontraron incidentes</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className={`incidents-${viewMode}`}>
              {filteredIncidents.map((incident) => (
                <div key={incident.id} className="incident-card" data-severity={incident.severity} data-status={incident.status}>
                  <div className="incident-severity-bar" style={{ backgroundColor: getSeverityColor(incident.severity) }} />
                  
                  <div className="incident-main">
                    <div className="incident-header">
                      <div className="incident-type-icon">
                        {getTypeIcon(incident.type)}
                      </div>
                      <div className="incident-title-section">
                        <h3 className="incident-title">{incident.title}</h3>
                        <div className="incident-meta">
                          <span className="incident-type">{getTypeLabel(incident.type)}</span>
                          <span className="incident-severity" style={{ color: getSeverityColor(incident.severity) }}>
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className="incident-status" style={{ color: getStatusColor(incident.status) }}>
                            {getStatusLabel(incident.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="incident-details">
                      <div className="detail-row">
                        <span className="detail-label">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Detectado:
                        </span>
                        <span className="detail-value">{formatTime(incident.detectedAt)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Servidores Afectados:
                        </span>
                        <span className="detail-value">{incident.affectedServers.length}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Tiempo de Respuesta:
                        </span>
                        <span className="detail-value">{calculateResponseTime(incident)}</span>
                      </div>
                    </div>

                    <div className="incident-actions">
                      <button className="action-btn" onClick={() => handleViewDetails(incident)}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Ver Detalles
                      </button>
                      {incident.status === 'active' && (
                        <button className="action-btn primary" onClick={() => handleStatusChange(incident.id, 'investigating')}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          Iniciar Investigación
                        </button>
                      )}
                      {incident.status === 'investigating' && (
                        <button className="action-btn warning" onClick={() => handleStatusChange(incident.id, 'contained')}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Contener
                        </button>
                      )}
                      {(incident.status === 'contained' || incident.status === 'investigating') && (
                        <button className="action-btn success" onClick={() => handleStatusChange(incident.id, 'resolved')}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Resolver
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal de detalles */}
      {showDetailsModal && selectedIncident && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal incident-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedIncident.title}</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Información General */}
              <div className="detail-section">
                <h3>Información General</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tipo</span>
                    <span className="detail-value">{getTypeLabel(selectedIncident.type)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Severidad</span>
                    <span className="detail-value" style={{ color: getSeverityColor(selectedIncident.severity) }}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estado</span>
                    <span className="detail-value" style={{ color: getStatusColor(selectedIncident.status) }}>
                      {getStatusLabel(selectedIncident.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Detectado</span>
                    <span className="detail-value">
                      {new Intl.DateTimeFormat('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(selectedIncident.detectedAt)}
                    </span>
                  </div>
                  {selectedIncident.resolvedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Resuelto</span>
                      <span className="detail-value">
                        {new Intl.DateTimeFormat('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(selectedIncident.resolvedAt)}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Tiempo de Respuesta</span>
                    <span className="detail-value">{calculateResponseTime(selectedIncident)}</span>
                  </div>
                </div>
              </div>

              {/* Servidores Afectados */}
              <div className="detail-section">
                <h3>Servidores Afectados</h3>
                <div className="servers-list">
                  {selectedIncident.affectedServers.map((serverId, index) => (
                    <div key={index} className="server-badge">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {serverId}
                    </div>
                  ))}
                </div>
              </div>

              {/* Respuestas Automatizadas */}
              {selectedIncident.automatedResponses.length > 0 && (
                <div className="detail-section">
                  <h3>Respuestas Automatizadas</h3>
                  <ul className="actions-list">
                    {selectedIncident.automatedResponses.map((response, index) => (
                      <li key={index}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {response}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Acciones Manuales */}
              {selectedIncident.manualActions.length > 0 && (
                <div className="detail-section">
                  <h3>Acciones Manuales</h3>
                  <ul className="actions-list manual">
                    {selectedIncident.manualActions.map((action, index) => (
                      <li key={index}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline */}
              <div className="detail-section">
                <h3>Timeline de Eventos</h3>
                <div className="timeline-container">
                  <div className="timeline-line" />
                  <div className="timeline-events">
                    {selectedIncident.timeline.map((event, index) => (
                      <div key={index} className="timeline-event">
                        <div className="timeline-marker" />
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-action">{event.action}</span>
                            <span className="timeline-time">{formatTime(event.timestamp)}</span>
                          </div>
                          <div className="timeline-actor">{event.actor === 'system' ? 'Sistema' : event.actor}</div>
                          <div className="timeline-description">{event.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Cerrar
              </button>
              {selectedIncident.status === 'active' && (
                <button className="btn-primary" onClick={() => {
                  handleStatusChange(selectedIncident.id, 'investigating');
                  setShowDetailsModal(false);
                }}>
                  Iniciar Investigación
                </button>
              )}
              {selectedIncident.status === 'investigating' && (
                <button className="btn-warning" onClick={() => {
                  handleStatusChange(selectedIncident.id, 'contained');
                  setShowDetailsModal(false);
                }}>
                  Contener Incidente
                </button>
              )}
              {(selectedIncident.status === 'contained' || selectedIncident.status === 'investigating') && (
                <button className="btn-success" onClick={() => {
                  handleStatusChange(selectedIncident.id, 'resolved');
                  setShowDetailsModal(false);
                }}>
                  Resolver Incidente
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;

