import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import OverviewCards from '../../components/Dashboard/OverviewCards/OverviewCards';
import ThreatMonitoring from '../../components/Dashboard/ThreatMonitoring/ThreatMonitoring';
import ServerStatusGrid from '../../components/Dashboard/ServerStatusGrid/ServerStatusGrid';
import ActiveAlerts from '../../components/Dashboard/ActiveAlerts/ActiveAlerts';
import QuickActions from '../../components/Dashboard/QuickActions/QuickActions';
import SystemHealth from '../../components/Dashboard/SystemHealth/SystemHealth';
import {
  OverviewMetrics,
  Threat,
  Server,
  Alert,
  SystemHealth as SystemHealthType,
} from '../../types/dashboard';
import './Dashboard.scss';

// Mock data - Replace with actual API calls
const generateMockData = () => {
  const mockThreats: Threat[] = [
    {
      id: '1',
      type: 'ransomware',
      severity: 'critical',
      serverId: 'srv-001',
      serverName: 'Servidor Principal',
      description: 'Intento de cifrado de archivos detectado en directorio /var/www',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'detected',
    },
    {
      id: '2',
      type: 'intrusion',
      severity: 'high',
      serverId: 'srv-002',
      serverName: 'Servidor de Base de Datos',
      description: 'Conexión no autorizada desde IP 192.168.1.100',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'investigating',
    },
    {
      id: '3',
      type: 'data_leak',
      severity: 'medium',
      serverId: 'srv-003',
      serverName: 'Servidor de Archivos',
      description: 'Intento de transferencia masiva de datos detectado',
      timestamp: new Date(Date.now() - 30 * 60000),
      status: 'detected',
    },
    {
      id: '4',
      type: 'anomalous_behavior',
      severity: 'low',
      serverId: 'srv-001',
      serverName: 'Servidor Principal',
      description: 'Actividad de CPU inusual detectada',
      timestamp: new Date(Date.now() - 45 * 60000),
      status: 'detected',
    },
  ];

  const mockServers: Server[] = [
    {
      id: 'srv-001',
      name: 'Servidor Principal',
      ip: '192.168.1.10',
      status: 'online',
      location: 'Centro de Datos A',
      department: 'IT',
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 38,
      lastActivity: new Date(Date.now() - 2 * 60000),
      tags: ['production', 'critical'],
    },
    {
      id: 'srv-002',
      name: 'Servidor de Base de Datos',
      ip: '192.168.1.11',
      status: 'online',
      location: 'Centro de Datos A',
      department: 'IT',
      cpuUsage: 78,
      memoryUsage: 85,
      diskUsage: 45,
      lastActivity: new Date(Date.now() - 1 * 60000),
      tags: ['production', 'database'],
    },
    {
      id: 'srv-003',
      name: 'Servidor de Archivos',
      ip: '192.168.1.12',
      status: 'warning',
      location: 'Centro de Datos B',
      department: 'IT',
      cpuUsage: 92,
      memoryUsage: 88,
      diskUsage: 78,
      lastActivity: new Date(Date.now() - 5 * 60000),
      tags: ['production'],
    },
    {
      id: 'srv-004',
      name: 'Servidor de Desarrollo',
      ip: '192.168.1.13',
      status: 'online',
      location: 'Centro de Datos B',
      department: 'Desarrollo',
      cpuUsage: 25,
      memoryUsage: 40,
      diskUsage: 55,
      lastActivity: new Date(Date.now() - 10 * 60000),
      tags: ['development'],
    },
  ];

  const mockAlerts: Alert[] = [
    {
      id: 'alert-001',
      type: 'ransomware',
      severity: 'critical',
      serverId: 'srv-001',
      serverName: 'Servidor Principal',
      title: 'Intento de Ransomware Detectado',
      description: 'Proceso sospechoso intentando cifrar archivos en /var/www',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'active',
    },
    {
      id: 'alert-002',
      type: 'intrusion',
      severity: 'high',
      serverId: 'srv-002',
      serverName: 'Servidor de Base de Datos',
      title: 'Intento de Intrusión',
      description: 'Múltiples intentos de acceso fallidos desde IP externa',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'acknowledged',
    },
    {
      id: 'alert-003',
      type: 'data_leak',
      severity: 'medium',
      serverId: 'srv-003',
      serverName: 'Servidor de Archivos',
      title: 'Posible Filtración de Datos',
      description: 'Transferencia masiva de archivos detectada',
      timestamp: new Date(Date.now() - 30 * 60000),
      status: 'active',
    },
  ];

  const mockOverview: OverviewMetrics = {
    securityStatus: 'warning',
    activeThreats: mockThreats.length,
    totalServers: mockServers.length,
    onlineServers: mockServers.filter((s) => s.status === 'online').length,
    offlineServers: mockServers.filter((s) => s.status === 'offline').length,
    recentIncidents24h: 5,
    recentIncidents7d: 12,
    systemUptime: 99.8,
    lastScan: new Date(Date.now() - 30 * 60000),
  };

  const mockSystemHealth: SystemHealthType = {
    backendStatus: 'healthy',
    databaseStatus: 'connected',
    apiResponseTime: 45,
    connectedAgents: 8,
    totalAgents: 10,
    lastHeartbeat: new Date(Date.now() - 1 * 60000),
    storageUsage: 65,
    logRetentionDays: 30,
  };

  return {
    threats: mockThreats,
    servers: mockServers,
    alerts: mockAlerts,
    overview: mockOverview,
    systemHealth: mockSystemHealth,
  };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mockData, setMockData] = useState(generateMockData());

  // Mock user data - Replace with actual auth context
  const user = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'admin',
    avatar: undefined,
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMockData(generateMockData());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    navigate('/login');
  };

  const handleAlertAction = {
    acknowledge: (id: string) => {
      console.log('Acknowledge alert:', id);
      // TODO: Implement API call
    },
    investigate: (id: string) => {
      console.log('Investigate alert:', id);
      navigate(`/incidents?alert=${id}`);
    },
    resolve: (id: string) => {
      console.log('Resolve alert:', id);
      // TODO: Implement API call
    },
    escalate: (id: string) => {
      console.log('Escalate alert:', id);
      // TODO: Implement API call
    },
  };

  const handleQuickAction = {
    runScan: () => {
      console.log('Run security scan');
      // TODO: Implement API call
    },
    generateReport: () => {
      console.log('Generate report');
      navigate('/reports');
    },
    exportData: () => {
      console.log('Export data');
      // TODO: Implement export logic
    },
    configureAlerts: () => {
      console.log('Configure alerts');
      navigate('/settings?tab=alerts');
    },
    addServer: () => {
      console.log('Add server');
      navigate('/servers?action=add');
    },
    emergencyLockdown: () => {
      if (window.confirm('¿Está seguro de que desea activar el bloqueo de emergencia?')) {
        console.log('Emergency lockdown');
        // TODO: Implement emergency lockdown
      }
    },
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark' : 'light'}`}>
      <Header
        user={user}
        notificationCount={mockData.alerts.filter((a) => a.status === 'active').length}
        onLogout={handleLogout}
      />
      <div className="dashboard-content">
        <Sidebar userRole={user.role} />
        <main className="dashboard-main">
          <div className="dashboard-scrollable">
            <OverviewCards metrics={mockData.overview} />
            
            <div className="dashboard-grid">
              <div className="dashboard-column main">
                <ThreatMonitoring threats={mockData.threats} />
                <ServerStatusGrid servers={mockData.servers} />
              </div>
              
              <div className="dashboard-column sidebar">
                <ActiveAlerts
                  alerts={mockData.alerts}
                  onAcknowledge={handleAlertAction.acknowledge}
                  onInvestigate={handleAlertAction.investigate}
                  onResolve={handleAlertAction.resolve}
                  onEscalate={handleAlertAction.escalate}
                />
                <QuickActions
                  onRunScan={handleQuickAction.runScan}
                  onGenerateReport={handleQuickAction.generateReport}
                  onExportData={handleQuickAction.exportData}
                  onConfigureAlerts={handleQuickAction.configureAlerts}
                  onAddServer={handleQuickAction.addServer}
                  onEmergencyLockdown={handleQuickAction.emergencyLockdown}
                />
                <SystemHealth health={mockData.systemHealth} />
              </div>
            </div>

            {/* Placeholder sections for future implementation */}
            <div className="dashboard-placeholders">
              <div className="placeholder-section">
                <h2>Detección de Ransomware</h2>
                <p>Sección en desarrollo - Mostrará detecciones activas de ransomware</p>
              </div>
              <div className="placeholder-section">
                <h2>Prevención de Filtración de Datos</h2>
                <p>Sección en desarrollo - Mostrará intentos de filtración bloqueados</p>
              </div>
              <div className="placeholder-section">
                <h2>Centro de Respuesta a Incidentes</h2>
                <p>Sección en desarrollo - Mostrará incidentes activos y su progreso</p>
              </div>
              <div className="placeholder-section">
                <h2>Métricas de Seguridad</h2>
                <p>Sección en desarrollo - Mostrará gráficos y visualizaciones de tendencias</p>
              </div>
              <div className="placeholder-section">
                <h2>Cumplimiento y Reportes</h2>
                <p>Sección en desarrollo - Mostrará estado de cumplimiento y acceso a reportes</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

