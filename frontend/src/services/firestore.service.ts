/**
 * Firestore Service for LINCOLN
 * Handles all Firestore database operations
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Server, Alert, Threat } from '../types/dashboard';

// Convertir Timestamp de Firestore a Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date();
};

// ===== SERVERS =====

export const serversService = {
  // Obtener todos los servidores
  getAll: async (): Promise<Server[]> => {
    const serversCol = collection(db, 'servers');
    const snapshot = await getDocs(serversCol);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        ip: data.ipAddress,
        status: data.status,
        location: data.location || 'N/A',
        department: data.department,
        cpuUsage: data.cpuUsage || 0,
        memoryUsage: data.memoryUsage || 0,
        diskUsage: data.diskUsage || 0,
        lastActivity: data.lastSeen ? timestampToDate(data.lastSeen) : new Date(),
        tags: data.tags || [],
      };
    });
  },

  // Listener en tiempo real para servidores
  onServersChange: (callback: (servers: Server[]) => void) => {
    const serversCol = collection(db, 'servers');
    return onSnapshot(serversCol, (snapshot) => {
      const servers = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          ip: data.ipAddress,
          status: data.status,
          location: data.location || 'N/A',
          department: data.department,
          cpuUsage: data.cpuUsage || 0,
          memoryUsage: data.memoryUsage || 0,
          diskUsage: data.diskUsage || 0,
          lastActivity: data.lastSeen ? timestampToDate(data.lastSeen) : new Date(),
          tags: data.tags || [],
        };
      });
      callback(servers);
    });
  },

  // Obtener servidor por ID
  getById: async (id: string): Promise<Server | null> => {
    const serverDoc = await getDoc(doc(db, 'servers', id));
    if (!serverDoc.exists()) return null;

    const data = serverDoc.data();
    return {
      id: serverDoc.id,
      name: data.name,
      ip: data.ipAddress,
      status: data.status,
      location: data.location || 'N/A',
      department: data.department,
      cpuUsage: data.cpuUsage || 0,
      memoryUsage: data.memoryUsage || 0,
      diskUsage: data.diskUsage || 0,
      lastActivity: data.lastSeen ? timestampToDate(data.lastSeen) : new Date(),
      tags: data.tags || [],
    };
  },
};

// ===== ALERTS =====

export const alertsService = {
  // Obtener todas las alertas
  getAll: async (): Promise<Alert[]> => {
    const alertsCol = collection(db, 'alerts');
    const q = query(alertsCol, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        severity: data.severity,
        serverId: data.serverId,
        serverName: data.serverName,
        title: data.title,
        description: data.description,
        timestamp: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
        status: data.status === 'open' ? 'active' : data.status,
      };
    });
  },

  // Listener en tiempo real para alertas
  onAlertsChange: (callback: (alerts: Alert[]) => void) => {
    const alertsCol = collection(db, 'alerts');
    const q = query(alertsCol, orderBy('createdAt', 'desc'), limit(50));
    
    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          severity: data.severity,
          serverId: data.serverId,
          serverName: data.serverName,
          title: data.title,
          description: data.description,
          timestamp: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
          status: data.status === 'open' ? 'active' : data.status,
        };
      });
      callback(alerts);
    });
  },

  // Obtener alertas activas
  getActive: async (): Promise<Alert[]> => {
    const alertsCol = collection(db, 'alerts');
    const q = query(
      alertsCol,
      where('status', 'in', ['open', 'acknowledged', 'in_progress']),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        severity: data.severity,
        serverId: data.serverId,
        serverName: data.serverName,
        title: data.title,
        description: data.description,
        timestamp: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
        status: 'active',
      };
    });
  },

  // Actualizar estado de alerta
  updateStatus: async (alertId: string, status: string) => {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  },
};

// ===== THREATS (Similar a Alerts pero diferente estructura) =====

export const threatsService = {
  // Las amenazas pueden venir de la colección de alertas filtradas
  getAll: async (): Promise<Threat[]> => {
    const alertsCol = collection(db, 'alerts');
    const q = query(
      alertsCol,
      where('status', 'in', ['open', 'acknowledged']),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        severity: data.severity,
        serverId: data.serverId,
        serverName: data.serverName,
        description: data.description,
        timestamp: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
        status: 'detected',
      };
    });
  },

  // Listener en tiempo real
  onThreatsChange: (callback: (threats: Threat[]) => void) => {
    const alertsCol = collection(db, 'alerts');
    const q = query(
      alertsCol,
      where('status', 'in', ['open', 'acknowledged']),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    return onSnapshot(q, (snapshot) => {
      const threats = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          severity: data.severity,
          serverId: data.serverId,
          serverName: data.serverName,
          description: data.description,
          timestamp: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
          status: 'detected',
        };
      });
      callback(threats);
    });
  },
};

// ===== STATISTICS =====

export const statsService = {
  // Calcular métricas de overview
  calculateOverview: async () => {
    const [servers, alerts] = await Promise.all([
      serversService.getAll(),
      alertsService.getAll(),
    ]);

    const onlineServers = servers.filter((s) => s.status === 'online').length;
    const offlineServers = servers.filter((s) => s.status === 'offline').length;
    const activeThreats = alerts.filter((a) => a.status === 'active').length;

    // Contar incidentes recientes (últimas 24h y 7 días)
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentIncidents24h = alerts.filter((a) => a.timestamp >= last24h).length;
    const recentIncidents7d = alerts.filter((a) => a.timestamp >= last7d).length;

    // Determinar estado de seguridad
    const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
    const highAlerts = alerts.filter((a) => a.severity === 'high' && a.status === 'active').length;

    let securityStatus: 'good' | 'warning' | 'critical' = 'good';
    if (criticalAlerts > 0) {
      securityStatus = 'critical';
    } else if (highAlerts > 0 || activeThreats > 3) {
      securityStatus = 'warning';
    }

    return {
      securityStatus,
      activeThreats,
      totalServers: servers.length,
      onlineServers,
      offlineServers,
      recentIncidents24h,
      recentIncidents7d,
      systemUptime: 99.8, // TODO: Calcular real
      lastScan: new Date(), // TODO: Obtener de config
    };
  },
};

export default {
  servers: serversService,
  alerts: alertsService,
  threats: threatsService,
  stats: statsService,
};

