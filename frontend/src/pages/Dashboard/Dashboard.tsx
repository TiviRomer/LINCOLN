import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
import firestoreService from '../../services/firestore.service';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Estados para datos reales de Firestore
  const [servers, setServers] = useState<Server[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics>({
    securityStatus: 'good',
    activeThreats: 0,
    totalServers: 0,
    onlineServers: 0,
    offlineServers: 0,
    recentIncidents24h: 0,
    recentIncidents7d: 0,
    systemUptime: 99.8,
    lastScan: new Date(),
  });
  const [loading, setLoading] = useState(true);

  // User data from Firebase Auth
  const user = {
    name: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario',
    email: currentUser?.email || '',
    role: userProfile?.role || 'user',
    avatar: currentUser?.photoURL || undefined,
  };

  // Cargar datos iniciales y configurar listeners en tiempo real
  useEffect(() => {
    console.log('🔄 Cargando datos del Dashboard desde Firestore...');
    
    let mounted = true;
    
    // Listeners en tiempo real
    const unsubscribeServers = firestoreService.servers.onServersChange((newServers) => {
      if (mounted) {
        console.log(`📡 Servidores actualizados: ${newServers.length}`);
        setServers(newServers);
      }
    });

    const unsubscribeAlerts = firestoreService.alerts.onAlertsChange((newAlerts) => {
      if (mounted) {
        console.log(`📡 Alertas actualizadas: ${newAlerts.length}`);
        setAlerts(newAlerts);
      }
    });

    const unsubscribeThreats = firestoreService.threats.onThreatsChange((newThreats) => {
      if (mounted) {
        console.log(`📡 Amenazas actualizadas: ${newThreats.length}`);
        setThreats(newThreats);
      }
    });

    // Cargar métricas iniciales
    firestoreService.stats.calculateOverview()
      .then((metrics) => {
        if (mounted) {
          setOverview(metrics);
          setLoading(false);
          console.log('✅ Datos del Dashboard cargados');
        }
      })
      .catch((error) => {
        console.error('❌ Error al cargar métricas:', error);
        if (mounted) {
          setLoading(false);
        }
      });

    // Actualizar métricas cada 30 segundos
    const metricsInterval = setInterval(() => {
      if (mounted) {
        firestoreService.stats.calculateOverview()
          .then((metrics) => {
            if (mounted) setOverview(metrics);
          })
          .catch((error) => console.error('Error actualizando métricas:', error));
      }
    }, 30000);

    // Cleanup: desuscribirse de todos los listeners
    return () => {
      mounted = false;
      unsubscribeServers();
      unsubscribeAlerts();
      unsubscribeThreats();
      clearInterval(metricsInterval);
      console.log('🔄 Listeners de Dashboard desconectados');
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleAlertAction = {
    acknowledge: async (id: string) => {
      try {
        await firestoreService.alerts.updateStatus(id, 'acknowledged');
        console.log('✅ Alerta reconocida:', id);
      } catch (error) {
        console.error('❌ Error al reconocer alerta:', error);
      }
    },
    investigate: (id: string) => {
      console.log('🔍 Investigando alerta:', id);
      navigate(`/incidents?alert=${id}`);
    },
    resolve: async (id: string) => {
      try {
        await firestoreService.alerts.updateStatus(id, 'resolved');
        console.log('✅ Alerta resuelta:', id);
      } catch (error) {
        console.error('❌ Error al resolver alerta:', error);
      }
    },
    escalate: async (id: string) => {
      try {
        await firestoreService.alerts.updateStatus(id, 'escalated');
        console.log('⬆️ Alerta escalada:', id);
      } catch (error) {
        console.error('❌ Error al escalar alerta:', error);
      }
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

  // SystemHealth mock (por ahora, hasta tener backend)
  const systemHealth: SystemHealthType = {
    backendStatus: 'healthy',
    databaseStatus: 'connected',
    apiResponseTime: 45,
    connectedAgents: servers.filter(s => s.status === 'online').length,
    totalAgents: servers.length,
    lastHeartbeat: new Date(),
    storageUsage: 65,
    logRetentionDays: 30,
  };

  if (loading) {
    return (
      <div className="dashboard-container dark">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
          <div>
            <div className="spinner" style={{ margin: '0 auto 20px', width: '50px', height: '50px' }}></div>
            <p>Cargando Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark' : 'light'}`}>
      <Header
        user={user}
        notificationCount={alerts.filter((a) => a.status === 'active').length}
        onLogout={handleLogout}
      />
      <div className="dashboard-content">
        <Sidebar userRole={user.role} />
        <main className="dashboard-main">
          <div className="dashboard-scrollable">
            <OverviewCards metrics={overview} />
            
            <div className="dashboard-grid">
              <div className="dashboard-column main">
                <ThreatMonitoring threats={threats} />
                <ServerStatusGrid servers={servers} />
              </div>
              
              <div className="dashboard-column sidebar">
                <ActiveAlerts
                  alerts={alerts}
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
                <SystemHealth health={systemHealth} />
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

