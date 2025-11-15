import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const DashboardTest: React.FC = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🔍 DashboardTest: Iniciando carga de datos...');
    
    const loadData = async () => {
      try {
        // Cargar servidores
        console.log('📡 Cargando servidores...');
        const serversCol = collection(db, 'servers');
        const serversSnap = await getDocs(serversCol);
        const serversList = serversSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('✅ Servidores cargados:', serversList.length);
        setServers(serversList);

        // Cargar alertas
        console.log('📡 Cargando alertas...');
        const alertsCol = collection(db, 'alerts');
        const alertsSnap = await getDocs(alertsCol);
        const alertsList = alertsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('✅ Alertas cargadas:', alertsList.length);
        setAlerts(alertsList);

        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error cargando datos:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div style={{ color: 'white', padding: '50px' }}>Cargando datos...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '50px' }}>Error: {error}</div>;
  }

  return (
    <div style={{ color: 'white', padding: '50px', backgroundColor: '#1a1a2e' }}>
      <h1>Dashboard Test - Datos de Firestore</h1>
      
      <h2>Servidores ({servers.length}):</h2>
      <ul>
        {servers.map((server) => (
          <li key={server.id}>
            {server.name} - {server.ipAddress} - {server.status}
          </li>
        ))}
      </ul>

      <h2>Alertas ({alerts.length}):</h2>
      <ul>
        {alerts.map((alert) => (
          <li key={alert.id}>
            {alert.title} - {alert.severity} - {alert.status}
          </li>
        ))}
      </ul>

      <p style={{ marginTop: '30px', color: '#4CAF50' }}>
        ✅ Si ves datos aquí, Firestore funciona correctamente
      </p>
    </div>
  );
};

export default DashboardTest;

