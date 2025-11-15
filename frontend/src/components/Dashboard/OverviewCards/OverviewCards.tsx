import React from 'react';
import { OverviewMetrics, SecurityStatus } from '../../../types/dashboard';
import './OverviewCards.scss';

interface OverviewCardsProps {
  metrics: OverviewMetrics;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ metrics }) => {
  const getStatusColor = (status: SecurityStatus): string => {
    switch (status) {
      case 'good':
        return '#00ff88';
      case 'warning':
        return '#ffaa00';
      case 'critical':
        return '#ff4444';
      default:
        return '#00d4ff';
    }
  };

  const getStatusLabel = (status: SecurityStatus): string => {
    switch (status) {
      case 'good':
        return 'Seguro';
      case 'warning':
        return 'Advertencia';
      case 'critical':
        return 'Crítico';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="overview-cards">
      <div className="overview-card security-status" data-status={metrics.securityStatus}>
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="card-content">
          <h3 className="card-label">Estado de Seguridad</h3>
          <div className="card-value" style={{ color: getStatusColor(metrics.securityStatus) }}>
            {getStatusLabel(metrics.securityStatus)}
          </div>
        </div>
        <div className="card-indicator" style={{ backgroundColor: getStatusColor(metrics.securityStatus) }} />
      </div>

      <div className="overview-card">
        <div className="card-icon threat">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="card-content">
          <h3 className="card-label">Amenazas Activas</h3>
          <div className="card-value">{metrics.activeThreats}</div>
          <div className="card-subtext">Amenazas detectadas</div>
        </div>
      </div>

      <div className="overview-card">
        <div className="card-icon server">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="2" y="7" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="2" y="11" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="2" y="15" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="2" y="19" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="card-content">
          <h3 className="card-label">Servidores Monitoreados</h3>
          <div className="card-value">
            {metrics.onlineServers}/{metrics.totalServers}
          </div>
          <div className="card-subtext">
            {metrics.onlineServers} en línea, {metrics.offlineServers} fuera de línea
          </div>
        </div>
      </div>

      <div className="overview-card">
        <div className="card-icon incident">
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
        </div>
        <div className="card-content">
          <h3 className="card-label">Incidentes Recientes</h3>
          <div className="card-value">{metrics.recentIncidents24h}</div>
          <div className="card-subtext">
            {metrics.recentIncidents24h} últimas 24h, {metrics.recentIncidents7d} últimos 7d
          </div>
        </div>
      </div>

      <div className="overview-card">
        <div className="card-icon uptime">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="card-content">
          <h3 className="card-label">Disponibilidad del Sistema</h3>
          <div className="card-value">{metrics.systemUptime.toFixed(2)}%</div>
          <div className="card-subtext">Tiempo de actividad</div>
        </div>
      </div>

      <div className="overview-card">
        <div className="card-icon scan">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="card-content">
          <h3 className="card-label">Último Escaneo</h3>
          <div className="card-value">{formatDate(metrics.lastScan)}</div>
          <div className="card-subtext">Escaneo de seguridad</div>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;

