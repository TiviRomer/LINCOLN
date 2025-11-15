import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import './Profile.scss';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '',
    email: currentUser?.email || '',
    phone: '',
    department: '',
    position: '',
  });

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
    // TODO: Implementar guardado de perfil
    console.log('Guardando perfil:', formData);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: '',
      department: '',
      position: '',
    });
    setEditing(false);
  };

  return (
    <div className="profile-container dark">
      <Header
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />
      <div className="profile-content">
        <Sidebar userRole={user.role} />
        <main className="profile-main">
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Mi Perfil</h1>
              <p className="page-subtitle">Gestiona tu información personal y preferencias</p>
            </div>
            {!editing && (
              <button className="btn-primary" onClick={() => setEditing(true)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Editar Perfil
              </button>
            )}
          </div>

          <div className="profile-grid">
            <div className="profile-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button className="avatar-change-btn">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Cambiar Foto
                </button>
              </div>

              <div className="profile-info-section">
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">{user.email}</p>
                <div className="profile-role-badge">
                  {user.role === 'admin' ? 'Administrador' : user.role === 'analyst' ? 'Analista' : 'Usuario'}
                </div>
              </div>
            </div>

            <div className="profile-details-card">
              <h2 className="section-title">Información Personal</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  {editing ? (
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <div className="form-value">{formData.name || 'No especificado'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="form-value">{formData.email}</div>
                  <span className="form-hint">El email no puede ser modificado</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  {editing ? (
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+57 300 123 4567"
                    />
                  ) : (
                    <div className="form-value">{formData.phone || 'No especificado'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Departamento</label>
                  {editing ? (
                    <input
                      type="text"
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="IT, Seguridad, etc."
                    />
                  ) : (
                    <div className="form-value">{formData.department || 'No especificado'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  {editing ? (
                    <input
                      type="text"
                      className="form-input"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Analista de Seguridad, etc."
                    />
                  ) : (
                    <div className="form-value">{formData.position || 'No especificado'}</div>
                  )}
                </div>

                {editing && (
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={handleCancel}>
                      Cancelar
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                      Guardar Cambios
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-stats-card">
              <h2 className="section-title">Estadísticas</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">24</div>
                  <div className="stat-label">Incidentes Resueltos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">156</div>
                  <div className="stat-label">Alertas Revisadas</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">12</div>
                  <div className="stat-label">Reportes Generados</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;

