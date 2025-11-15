import React, { useState } from 'react';
import { Server, ServerStatus } from '../../../types/dashboard';
import './ServerStatusGrid.scss';

interface ServerStatusGridProps {
  servers: Server[];
}

const ServerStatusGrid: React.FC<ServerStatusGridProps> = ({ servers }) => {
  const [groupBy, setGroupBy] = useState<'none' | 'location' | 'department'>('none');

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

  const groupedServers = servers.reduce((acc, server) => {
    if (groupBy === 'none') {
      acc['all'] = acc['all'] || [];
      acc['all'].push(server);
    } else if (groupBy === 'location') {
      const key = server.location || 'Sin ubicación';
      acc[key] = acc[key] || [];
      acc[key].push(server);
    } else if (groupBy === 'department') {
      const key = server.department || 'Sin departamento';
      acc[key] = acc[key] || [];
      acc[key].push(server);
    }
    return acc;
  }, {} as Record<string, Server[]>);

  return (
    <div className="server-status-grid">
      <div className="section-header">
        <h2 className="section-title">Estado de Servidores</h2>
        <div className="section-controls">
          <select
            className="group-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'none' | 'location' | 'department')}
          >
            <option value="none">Sin agrupar</option>
            <option value="location">Por Ubicación</option>
            <option value="department">Por Departamento</option>
          </select>
        </div>
      </div>

      <div className="servers-container">
        {Object.entries(groupedServers).map(([group, groupServers]) => (
          <div key={group} className="server-group">
            {groupBy !== 'none' && <h3 className="group-title">{group}</h3>}
            <div className="servers-grid">
              {groupServers.map((server) => (
                <div key={server.id} className="server-card" data-status={server.status}>
                  <div className="server-header">
                    <div className="server-status-indicator" style={{ backgroundColor: getStatusColor(server.status) }} />
                    <div className="server-info">
                      <h3 className="server-name">{server.name}</h3>
                      <span className="server-ip">{server.ip}</span>
                    </div>
                  </div>

                  <div className="server-health">
                    <div className="health-metric">
                      <span className="metric-label">CPU</span>
                      <div className="metric-bar">
                        <div
                          className="metric-fill cpu"
                          style={{ width: `${server.cpuUsage}%` }}
                        />
                        <span className="metric-value">{server.cpuUsage}%</span>
                      </div>
                    </div>
                    <div className="health-metric">
                      <span className="metric-label">RAM</span>
                      <div className="metric-bar">
                        <div
                          className="metric-fill memory"
                          style={{ width: `${server.memoryUsage}%` }}
                        />
                        <span className="metric-value">{server.memoryUsage}%</span>
                      </div>
                    </div>
                    <div className="health-metric">
                      <span className="metric-label">Disco</span>
                      <div className="metric-bar">
                        <div
                          className="metric-fill disk"
                          style={{ width: `${server.diskUsage}%` }}
                        />
                        <span className="metric-value">{server.diskUsage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="server-footer">
                    <div className="server-location">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {server.location}
                    </div>
                    <div className="server-last-activity">
                      {formatDate(server.lastActivity)}
                    </div>
                  </div>

                  <div className="server-actions">
                    <button className="action-button" title="Ver detalles">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                    <button className="action-button" title="Ejecutar escaneo">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button className="action-button" title="Configurar">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.364-6.364-4.243 4.243m0 0-4.243 4.243m4.243-4.243L12 8.586m4.243 4.243L20.364 4.636M12 8.586 8.586 12m0 0-4.243 4.243M8.586 12 4.343 7.757m0 9.9 4.243-4.243M8.586 12l3.414 3.414"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServerStatusGrid;

