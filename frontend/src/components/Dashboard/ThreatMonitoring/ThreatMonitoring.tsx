import React, { useState } from 'react';
import { Threat, ThreatSeverity, ThreatType } from '../../../types/dashboard';
import './ThreatMonitoring.scss';

interface ThreatMonitoringProps {
  threats: Threat[];
}

const ThreatMonitoring: React.FC<ThreatMonitoringProps> = ({ threats }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<ThreatSeverity | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ThreatType | 'all'>('all');

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

  const filteredThreats = threats.filter((threat) => {
    if (selectedSeverity !== 'all' && threat.severity !== selectedSeverity) return false;
    if (selectedType !== 'all' && threat.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="threat-monitoring">
      <div className="section-header">
        <div className="section-title-group">
          <h2 className="section-title">Monitoreo de Amenazas en Tiempo Real</h2>
          <span className="live-indicator">
            <span className="live-dot" />
            En Vivo
          </span>
        </div>
        <div className="section-filters">
          <select
            className="filter-select"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as ThreatSeverity | 'all')}
          >
            <option value="all">Todas las Severidades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ThreatType | 'all')}
          >
            <option value="all">Todos los Tipos</option>
            <option value="ransomware">Ransomware</option>
            <option value="intrusion">Intrusión</option>
            <option value="data_leak">Filtración de Datos</option>
            <option value="anomalous_behavior">Comportamiento Anómalo</option>
          </select>
        </div>
      </div>

      <div className="threat-timeline">
        <div className="timeline-line" />
        <div className="threat-list">
          {filteredThreats.length === 0 ? (
            <div className="empty-state">No hay amenazas que mostrar con los filtros seleccionados</div>
          ) : (
            filteredThreats.map((threat) => (
              <div key={threat.id} className="threat-item" data-severity={threat.severity}>
                <div className="threat-marker" style={{ backgroundColor: getSeverityColor(threat.severity) }} />
                <div className="threat-content">
                  <div className="threat-header">
                    <span className="threat-type">{getTypeLabel(threat.type)}</span>
                    <span className="threat-severity" style={{ color: getSeverityColor(threat.severity) }}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="threat-description">{threat.description}</div>
                  <div className="threat-meta">
                    <span className="threat-server">{threat.serverName}</span>
                    <span className="threat-time">{formatTime(threat.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatMonitoring;

