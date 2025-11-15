import React from 'react';
import './QuickActions.scss';

interface QuickActionsProps {
  onRunScan: () => void;
  onGenerateReport: () => void;
  onExportData: () => void;
  onConfigureAlerts: () => void;
  onAddServer: () => void;
  onEmergencyLockdown: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onRunScan,
  onGenerateReport,
  onExportData,
  onConfigureAlerts,
  onAddServer,
  onEmergencyLockdown,
}) => {
  const actions = [
    {
      label: 'Ejecutar Escaneo',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      onClick: onRunScan,
      color: '#00d4ff',
    },
    {
      label: 'Generar Reporte',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: onGenerateReport,
      color: '#00ff88',
    },
    {
      label: 'Exportar Datos',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      onClick: onExportData,
      color: '#8a2be2',
    },
    {
      label: 'Configurar Alertas',
      icon: (
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
      ),
      onClick: onConfigureAlerts,
      color: '#ffaa00',
    },
    {
      label: 'Agregar Servidor',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      onClick: onAddServer,
      color: '#00ff88',
    },
    {
      label: 'Bloqueo de Emergencia',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M7 11V7a5 5 0 0 1 10 0v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      onClick: onEmergencyLockdown,
      color: '#ff4444',
      warning: true,
    },
  ];

  return (
    <div className="quick-actions">
      <h2 className="section-title">Acciones Rápidas</h2>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`action-card ${action.warning ? 'warning' : ''}`}
            onClick={action.onClick}
            style={{ '--action-color': action.color } as React.CSSProperties}
          >
            <div className="action-icon" style={{ color: action.color }}>
              {action.icon}
            </div>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

