import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import './Reports.scss';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  const [selectedReportType, setSelectedReportType] = useState<string>('security');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
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

  const handleGenerateReport = () => {
    setLoading(true);
    // TODO: Implementar generación de reporte
    setTimeout(() => {
      setLoading(false);
      console.log('Generando reporte...');
    }, 2000);
  };

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exportando reporte en formato ${format}`);
    // TODO: Implementar exportación
  };

  const reportTypes = [
    {
      id: 'security',
      name: 'Reporte de Seguridad',
      description: 'Análisis completo de amenazas y vulnerabilidades',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'incidents',
      name: 'Reporte de Incidentes',
      description: 'Resumen de incidentes y tiempos de respuesta',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'servers',
      name: 'Reporte de Servidores',
      description: 'Estado y métricas de todos los servidores',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="2" y="10" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="2" y="17" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'compliance',
      name: 'Reporte de Cumplimiento',
      description: 'Estado de cumplimiento normativo y auditorías',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Reporte de Seguridad - Enero 2025',
      type: 'security',
      generatedAt: new Date('2025-01-15'),
      format: 'PDF',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Reporte de Incidentes - Semana 2',
      type: 'incidents',
      generatedAt: new Date('2025-01-10'),
      format: 'CSV',
      size: '856 KB',
    },
    {
      id: '3',
      name: 'Reporte de Cumplimiento - Q4 2024',
      type: 'compliance',
      generatedAt: new Date('2024-12-31'),
      format: 'PDF',
      size: '5.1 MB',
    },
  ];

  return (
    <div className="reports-container dark">
      <Header
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />
      <div className="reports-content">
        <Sidebar userRole={user.role} />
        <main className="reports-main">
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Reportes y Análisis</h1>
              <p className="page-subtitle">Genera y descarga reportes detallados del sistema</p>
            </div>
            <button className="btn-primary" onClick={handleGenerateReport} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small" />
                  Generando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Generar Reporte
                </>
              )}
            </button>
          </div>

          <div className="reports-grid">
            <div className="reports-section">
              <h2 className="section-title">Tipos de Reporte</h2>
              <div className="report-types-grid">
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`report-type-card ${selectedReportType === type.id ? 'selected' : ''}`}
                    onClick={() => setSelectedReportType(type.id)}
                  >
                    <div className="report-type-icon">{type.icon}</div>
                    <h3 className="report-type-name">{type.name}</h3>
                    <p className="report-type-description">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reports-section">
              <h2 className="section-title">Configuración</h2>
              <div className="config-card">
                <div className="config-item">
                  <label className="config-label">Rango de Fechas</label>
                  <div className="date-range-buttons">
                    {(['7d', '30d', '90d', 'custom'] as const).map((range) => (
                      <button
                        key={range}
                        className={`date-range-btn ${dateRange === range ? 'active' : ''}`}
                        onClick={() => setDateRange(range)}
                      >
                        {range === '7d' ? '7 días' : range === '30d' ? '30 días' : range === '90d' ? '90 días' : 'Personalizado'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="config-item">
                  <label className="config-label">Formato de Exportación</label>
                  <div className="export-buttons">
                    <button className="export-btn" onClick={() => handleExportReport('pdf')}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      PDF
                    </button>
                    <button className="export-btn" onClick={() => handleExportReport('csv')}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      CSV
                    </button>
                    <button className="export-btn" onClick={() => handleExportReport('excel')}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reports-section">
            <h2 className="section-title">Reportes Recientes</h2>
            <div className="recent-reports-list">
              {recentReports.map((report) => (
                <div key={report.id} className="recent-report-card">
                  <div className="report-info">
                    <h3 className="report-name">{report.name}</h3>
                    <div className="report-meta">
                      <span className="report-date">
                        {new Intl.DateTimeFormat('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }).format(report.generatedAt)}
                      </span>
                      <span className="report-format">{report.format}</span>
                      <span className="report-size">{report.size}</span>
                    </div>
                  </div>
                  <div className="report-actions">
                    <button className="action-btn" title="Descargar">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button className="action-btn" title="Eliminar">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;

