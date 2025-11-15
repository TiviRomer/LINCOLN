import React from 'react';
import { Alert, ThreatSeverity } from '../../../types/dashboard';
import './ActiveAlerts.scss';

interface ActiveAlertsProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onInvestigate: (id: string) => void;
  onResolve: (id: string) => void;
  onEscalate: (id: string) => void;
}

const ActiveAlerts: React.FC<ActiveAlertsProps> = ({
  alerts,
  onAcknowledge,
  onInvestigate,
  onResolve,
  onEscalate,
}) => {
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

  const formatTime = (date: Date): string => {
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

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const otherAlerts = alerts.filter((a) => a.severity !== 'critical');

  return (
    <div className="active-alerts">
      <div className="section-header">
        <h2 className="section-title">Alertas Activas</h2>
        <span className="alert-count">{alerts.length} alertas</span>
      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="empty-state">No hay alertas activas</div>
        ) : (
          <>
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="alert-item critical" data-severity={alert.severity}>
                <div className="alert-severity-bar" style={{ backgroundColor: getSeverityColor(alert.severity) }} />
                <div className="alert-content">
                  <div className="alert-header">
                    <h3 className="alert-title">{alert.title}</h3>
                    <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="alert-description">{alert.description}</p>
                  <div className="alert-meta">
                    <span className="alert-server">{alert.serverName}</span>
                    <span className="alert-time">{formatTime(alert.timestamp)}</span>
                  </div>
                  <div className="alert-actions">
                    {alert.status === 'active' && (
                      <>
                        <button className="alert-action-btn" onClick={() => onAcknowledge(alert.id)}>
                          Reconocer
                        </button>
                        <button className="alert-action-btn primary" onClick={() => onInvestigate(alert.id)}>
                          Investigar
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <>
                        <button className="alert-action-btn primary" onClick={() => onInvestigate(alert.id)}>
                          Investigar
                        </button>
                        <button className="alert-action-btn success" onClick={() => onResolve(alert.id)}>
                          Resolver
                        </button>
                      </>
                    )}
                    <button className="alert-action-btn warning" onClick={() => onEscalate(alert.id)}>
                      Escalar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {otherAlerts.map((alert) => (
              <div key={alert.id} className="alert-item" data-severity={alert.severity}>
                <div className="alert-severity-bar" style={{ backgroundColor: getSeverityColor(alert.severity) }} />
                <div className="alert-content">
                  <div className="alert-header">
                    <h3 className="alert-title">{alert.title}</h3>
                    <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="alert-description">{alert.description}</p>
                  <div className="alert-meta">
                    <span className="alert-server">{alert.serverName}</span>
                    <span className="alert-time">{formatTime(alert.timestamp)}</span>
                  </div>
                  <div className="alert-actions">
                    {alert.status === 'active' && (
                      <>
                        <button className="alert-action-btn" onClick={() => onAcknowledge(alert.id)}>
                          Reconocer
                        </button>
                        <button className="alert-action-btn primary" onClick={() => onInvestigate(alert.id)}>
                          Investigar
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <>
                        <button className="alert-action-btn primary" onClick={() => onInvestigate(alert.id)}>
                          Investigar
                        </button>
                        <button className="alert-action-btn success" onClick={() => onResolve(alert.id)}>
                          Resolver
                        </button>
                      </>
                    )}
                    <button className="alert-action-btn warning" onClick={() => onEscalate(alert.id)}>
                      Escalar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ActiveAlerts;

