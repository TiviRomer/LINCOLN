import React from 'react';
import { SystemHealth as SystemHealthType } from '../../../types/dashboard';
import './SystemHealth.scss';

interface SystemHealthProps {
  health: SystemHealthType;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ health }) => {
  const getStatusColor = (status: string): string => {
    if (status === 'healthy' || status === 'connected') return '#00ff88';
    if (status === 'degraded') return '#ffaa00';
    return '#ff4444';
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="system-health">
      <h2 className="section-title">Salud del Sistema</h2>
      <div className="health-grid">
        <div className="health-item">
          <div className="health-label">Estado del Backend</div>
          <div className="health-value" style={{ color: getStatusColor(health.backendStatus) }}>
            {health.backendStatus === 'healthy' ? 'Saludable' : health.backendStatus === 'degraded' ? 'Degradado' : 'Caído'}
          </div>
          <div className="health-metric">
            Tiempo de respuesta API: {health.apiResponseTime}ms
          </div>
        </div>

        <div className="health-item">
          <div className="health-label">Base de Datos</div>
          <div className="health-value" style={{ color: getStatusColor(health.databaseStatus) }}>
            {health.databaseStatus === 'connected' ? 'Conectada' : 'Desconectada'}
          </div>
        </div>

        <div className="health-item">
          <div className="health-label">Agentes Conectados</div>
          <div className="health-value">
            {health.connectedAgents}/{health.totalAgents}
          </div>
          <div className="health-metric">
            Último latido: {formatDate(health.lastHeartbeat)}
          </div>
        </div>

        <div className="health-item">
          <div className="health-label">Almacenamiento</div>
          <div className="health-value">
            {health.storageUsage.toFixed(1)}%
          </div>
          <div className="health-metric">
            Retención: {health.logRetentionDays} días
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;

