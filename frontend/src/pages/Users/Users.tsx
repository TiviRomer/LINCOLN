import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import './Users.scss';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: new Date('2025-01-15'),
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Security Analyst',
      email: 'analyst@example.com',
      role: 'analyst',
      status: 'active',
      lastLogin: new Date('2025-01-14'),
      createdAt: new Date('2024-06-15'),
    },
    {
      id: '3',
      name: 'Viewer User',
      email: 'viewer@example.com',
      role: 'viewer',
      status: 'active',
      lastLogin: new Date('2025-01-10'),
      createdAt: new Date('2024-09-20'),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ff4444';
      case 'analyst': return '#00d4ff';
      case 'viewer': return '#00ff88';
      default: return '#78909c';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'analyst': return 'Analista';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  if (user.role !== 'admin') {
    return (
      <ProtectedRoute>
        <div className="users-container dark">
          <div className="access-denied">
            <h2>Acceso Denegado</h2>
            <p>No tienes permisos para acceder a esta sección.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="users-container dark">
      <Header
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />
      <div className="users-content">
        <Sidebar userRole={user.role} />
        <main className="users-main">
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Usuarios y Permisos</h1>
              <p className="page-subtitle">Gestiona usuarios y sus permisos en el sistema</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Agregar Usuario
            </button>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Usuarios</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{users.filter(u => u.status === 'active').length}</div>
              <div className="stat-label">Activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
              <div className="stat-label">Administradores</div>
            </div>
          </div>

          <div className="controls-bar">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters">
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="analyst">Analista</option>
                <option value="viewer">Visualizador</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="users-table">
            <div className="table-header">
              <div className="table-cell">Usuario</div>
              <div className="table-cell">Rol</div>
              <div className="table-cell">Estado</div>
              <div className="table-cell">Último Acceso</div>
              <div className="table-cell">Acciones</div>
            </div>
            {filteredUsers.map((user) => (
              <div key={user.id} className="table-row">
                <div className="table-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="table-cell">
                  <span className="role-badge" style={{ backgroundColor: getRoleColor(user.role) }}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="table-cell">
                  {new Intl.DateTimeFormat('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).format(user.lastLogin)}
                </div>
                <div className="table-cell">
                  <div className="table-actions">
                    <button className="action-btn" onClick={() => setSelectedUser(user)}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button className="action-btn danger">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;

