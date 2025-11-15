import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import { Server, ServerStatus } from '../../types/dashboard';
import firestoreService from '../../services/firestore.service';
import './Servers.scss';

const Servers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile, logout } = useAuth();
  
  // Estados
  const [servers, setServers] = useState<Server[]>([]);
  const [filteredServers, setFilteredServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ServerStatus | 'all'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);

  // User data
  const user = {
    name: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario',
    email: currentUser?.email || '',
    role: userProfile?.role || 'user',
    avatar: currentUser?.photoURL || undefined,
  };

  // Cargar servidores en tiempo real
  useEffect(() => {
    console.log('🔄 Cargando servidores...');
    let mounted = true;

    const unsubscribe = firestoreService.servers.onServersChange((newServers) => {
      if (mounted) {
        console.log(`📡 Servidores actualizados: ${newServers.length}`);
        setServers(newServers);
        setLoading(false);
      }
    });

    // Verificar si hay acción de agregar servidor desde URL
    const action = searchParams.get('action');
    if (action === 'add') {
      setShowModal(true);
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [searchParams]);

  // Filtrar servidores
  useEffect(() => {
    let filtered = servers;

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.ip.toLowerCase().includes(term) ||
          s.location.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    // Filtro por departamento
    if (filterDepartment !== 'all') {
      filtered = filtered.filter((s) => s.department === filterDepartment);
    }

    // Filtro por environment
    if (filterEnvironment !== 'all') {
      const serverWithEnv = servers.find(s => s.id === filtered[0]?.id);
      // Por ahora, este filtro no está disponible en el tipo Server de dashboard
      // pero lo dejamos preparado para cuando se agregue
    }

    setFilteredServers(filtered);
  }, [servers, searchTerm, filterStatus, filterDepartment, filterEnvironment]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getStatusColor = (status: ServerStatus): string => {
    switch (status) {
      case 'online':
        return '#00ff88';
      case 'warning':
        return '#ffaa00';
      case 'offline':
        return '#ff4444';
      default:
        return '#00d4ff';
    }
  };

  const getStatusLabel = (status: ServerStatus): string => {
    switch (status) {
      case 'online':
        return 'En Línea';
      case 'warning':
        return 'Advertencia';
      case 'offline':
        return 'Fuera de Línea';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleViewDetails = (server: Server) => {
    setSelectedServer(server);
    // En una implementación real, podrías navegar a una página de detalles
    console.log('Ver detalles de:', server);
  };

  const handleAddServer = () => {
    setSelectedServer(null);
    setShowModal(true);
  };

  const handleEditServer = (server: Server) => {
    setSelectedServer(server);
    setShowModal(true);
  };

  const handleDeleteServer = (server: Server) => {
    setServerToDelete(server);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (serverToDelete) {
      console.log('🗑️ Eliminando servidor:', serverToDelete.id);
      // TODO: Implementar eliminación en Firestore
      // await firestoreService.servers.delete(serverToDelete.id);
      setShowDeleteConfirm(false);
      setServerToDelete(null);
    }
  };

  const handleScanServer = (server: Server) => {
    console.log('🔍 Escaneando servidor:', server.id);
    // TODO: Implementar escaneo de servidor
  };

  const handleSaveServer = (serverData: any) => {
    console.log('💾 Guardando servidor:', serverData);
    // TODO: Implementar guardado en Firestore
    setShowModal(false);
  };

  // Estadísticas
  const stats = {
    total: servers.length,
    online: servers.filter((s) => s.status === 'online').length,
    offline: servers.filter((s) => s.status === 'offline').length,
    warning: servers.filter((s) => s.status === 'warning').length,
  };

  // Obtener departamentos únicos
  const departments = Array.from(new Set(servers.map((s) => s.department).filter(Boolean)));

  if (loading) {
    return (
      <div className="servers-container dark">
        <div className="loading-screen">
          <div className="spinner" />
          <p>Cargando Servidores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="servers-container dark">
      <Header
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />
      <div className="servers-content">
        <Sidebar userRole={user.role} />
        <main className="servers-main">
          {/* Header de la página */}
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Gestión de Servidores</h1>
              <p className="page-subtitle">Monitoreo y administración de infraestructura</p>
            </div>
            <button className="btn-primary" onClick={handleAddServer}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Agregar Servidor
            </button>
          </div>

          {/* Estadísticas */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon total">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="2" y="10" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="2" y="17" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Servidores</div>
              </div>
            </div>

            <div className="stat-card online">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.online}</div>
                <div className="stat-label">En Línea</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.warning}</div>
                <div className="stat-label">Con Advertencias</div>
              </div>
            </div>

            <div className="stat-card offline">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.offline}</div>
                <div className="stat-label">Fuera de Línea</div>
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
                placeholder="Buscar por nombre, IP o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ServerStatus | 'all')}>
                <option value="all">Todos los estados</option>
                <option value="online">En Línea</option>
                <option value="warning">Advertencia</option>
                <option value="offline">Fuera de Línea</option>
              </select>

              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="all">Todos los departamentos</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Vista de cuadrícula"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de servidores */}
          {filteredServers.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="2" y="10" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="2" y="17" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
              </svg>
              <h3>No se encontraron servidores</h3>
              <p>Intenta ajustar los filtros o agrega un nuevo servidor</p>
              <button className="btn-secondary" onClick={handleAddServer}>
                Agregar Primer Servidor
              </button>
            </div>
          ) : (
            <div className={`servers-${viewMode}`}>
              {filteredServers.map((server) => (
                <div key={server.id} className="server-item" data-status={server.status}>
                  <div className="server-status-bar" style={{ backgroundColor: getStatusColor(server.status) }} />
                  
                  <div className="server-main-info">
                    <div className="server-header">
                      <div className="server-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                          <rect x="2" y="10" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                          <rect x="2" y="17" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                      <div className="server-title-info">
                        <h3 className="server-name">{server.name}</h3>
                        <div className="server-meta">
                          <span className="server-ip">{server.ip}</span>
                          <span className="server-status" style={{ color: getStatusColor(server.status) }}>
                            {getStatusLabel(server.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="server-details">
                      <div className="detail-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span>{server.location}</span>
                      </div>
                      {server.department && (
                        <div className="detail-item">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          <span>{server.department}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{formatDate(server.lastActivity)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="server-metrics">
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">CPU</span>
                        <span className="metric-value">{server.cpuUsage}%</span>
                      </div>
                      <div className="metric-bar">
                        <div
                          className="metric-fill cpu"
                          style={{ width: `${server.cpuUsage}%` }}
                        />
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Memoria</span>
                        <span className="metric-value">{server.memoryUsage}%</span>
                      </div>
                      <div className="metric-bar">
                        <div
                          className="metric-fill memory"
                          style={{ width: `${server.memoryUsage}%` }}
                        />
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Disco</span>
                        <span className="metric-value">{server.diskUsage}%</span>
                      </div>
                      <div className="metric-bar">
                        <div
                          className="metric-fill disk"
                          style={{ width: `${server.diskUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="server-actions">
                    <button className="action-btn" onClick={() => handleViewDetails(server)} title="Ver detalles">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                    <button className="action-btn" onClick={() => handleScanServer(server)} title="Escanear">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button className="action-btn" onClick={() => handleEditServer(server)} title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button className="action-btn danger" onClick={() => handleDeleteServer(server)} title="Eliminar">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {server.tags && server.tags.length > 0 && (
                    <div className="server-tags">
                      {server.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p>
                ¿Estás seguro de que deseas eliminar el servidor <strong>{serverToDelete?.name}</strong>?
              </p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Eliminar Servidor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de agregar/editar servidor */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal server-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedServer ? 'Editar Servidor' : 'Agregar Nuevo Servidor'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="info-text">
                Funcionalidad de agregar/editar servidor en desarrollo. 
                Esta función se conectará con Firestore para crear y actualizar servidores.
              </p>
              {/* TODO: Implementar formulario completo */}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={() => handleSaveServer({})}>
                {selectedServer ? 'Guardar Cambios' : 'Crear Servidor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servers;

