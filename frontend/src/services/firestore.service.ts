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
import { Server, Alert, Threat, Incident, IncidentStatus, IncidentTimelineEvent } from '../types/dashboard';

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

// ===== INCIDENTS =====

export const incidentsService = {
  // Obtener todos los incidentes
  getAll: async (): Promise<Incident[]> => {
    const incidentsCol = collection(db, 'incidents');
    const q = query(incidentsCol, orderBy('detectedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        type: data.type,
        severity: data.severity,
        status: data.status,
        affectedServers: data.affectedServers || [],
        detectedAt: data.detectedAt ? timestampToDate(data.detectedAt) : new Date(),
        resolvedAt: data.resolvedAt ? timestampToDate(data.resolvedAt) : undefined,
        automatedResponses: data.automatedResponses || [],
        manualActions: data.manualActions || [],
        timeline: (data.timeline || []).map((event: any) => ({
          timestamp: timestampToDate(event.timestamp),
          action: event.action,
          actor: event.actor,
          description: event.description,
        })),
      };
    });
  },

  // Listener en tiempo real para incidentes
  onIncidentsChange: (
    callback: (incidents: Incident[]) => void,
    onError?: (error: Error) => void
  ) => {
    const incidentsCol = collection(db, 'incidents');
    const q = query(incidentsCol, orderBy('detectedAt', 'desc'));
    
    return onSnapshot(
      q,
      (snapshot) => {
        try {
          const incidents = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || 'Sin título',
              type: data.type || 'anomalous_behavior',
              severity: data.severity || 'medium',
              status: data.status || 'active',
              affectedServers: data.affectedServers || [],
              detectedAt: data.detectedAt ? timestampToDate(data.detectedAt) : new Date(),
              resolvedAt: data.resolvedAt ? timestampToDate(data.resolvedAt) : undefined,
              automatedResponses: data.automatedResponses || [],
              manualActions: data.manualActions || [],
              timeline: (data.timeline || []).map((event: any) => ({
                timestamp: event.timestamp ? timestampToDate(event.timestamp) : new Date(),
                action: event.action || 'unknown',
                actor: event.actor || 'system',
                description: event.description || '',
              })),
            };
          });
          callback(incidents);
        } catch (error) {
          console.error('Error procesando incidentes:', error);
          if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)));
          } else {
            // Si no hay callback de error, al menos devolver array vacío
            callback([]);
          }
        }
      },
      (error) => {
        console.error('Error en listener de incidentes:', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        } else {
          // Si no hay callback de error, al menos devolver array vacío
          callback([]);
        }
      }
    );
  },

  // Obtener incidente por ID
  getById: async (id: string): Promise<Incident | null> => {
    const incidentDoc = await getDoc(doc(db, 'incidents', id));
    if (!incidentDoc.exists()) return null;

    const data = incidentDoc.data();
    return {
      id: incidentDoc.id,
      title: data.title,
      type: data.type,
      severity: data.severity,
      status: data.status,
      affectedServers: data.affectedServers || [],
      detectedAt: data.detectedAt ? timestampToDate(data.detectedAt) : new Date(),
      resolvedAt: data.resolvedAt ? timestampToDate(data.resolvedAt) : undefined,
      automatedResponses: data.automatedResponses || [],
      manualActions: data.manualActions || [],
      timeline: (data.timeline || []).map((event: any) => ({
        timestamp: timestampToDate(event.timestamp),
        action: event.action,
        actor: event.actor,
        description: event.description,
      })),
    };
  },

  // Crear nuevo incidente
  create: async (incidentData: Omit<Incident, 'id' | 'detectedAt' | 'resolvedAt' | 'timeline'> & {
    detectedAt?: Date;
    resolvedAt?: Date;
    timeline?: IncidentTimelineEvent[];
  }): Promise<string> => {
    const incidentsCol = collection(db, 'incidents');
    const newIncident: any = {
      ...incidentData,
      detectedAt: incidentData.detectedAt ? Timestamp.fromDate(incidentData.detectedAt) : serverTimestamp(),
      resolvedAt: incidentData.resolvedAt ? Timestamp.fromDate(incidentData.resolvedAt) : null,
      timeline: (incidentData.timeline || []).map((event) => ({
        ...event,
        timestamp: event.timestamp instanceof Date ? Timestamp.fromDate(event.timestamp) : serverTimestamp(),
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Remover campos undefined
    Object.keys(newIncident).forEach(key => {
      if (newIncident[key] === undefined) {
        delete newIncident[key];
      }
    });
    
    const docRef = await addDoc(incidentsCol, newIncident);
    return docRef.id;
  },

  // Actualizar estado de incidente
  updateStatus: async (incidentId: string, status: IncidentStatus, actor: string, description?: string) => {
    const incidentRef = doc(db, 'incidents', incidentId);
    const incidentDoc = await getDoc(incidentRef);
    
    if (!incidentDoc.exists()) {
      throw new Error('Incident not found');
    }

    const currentData = incidentDoc.data();
    const currentTimeline = currentData.timeline || [];
    
    const newTimelineEvent = {
      timestamp: serverTimestamp(),
      action: status,
      actor: actor,
      description: description || `Estado cambiado a ${status}`,
    };

    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
      timeline: [...currentTimeline, newTimelineEvent],
    };

    if (status === 'resolved') {
      updateData.resolvedAt = serverTimestamp();
    }

    await updateDoc(incidentRef, updateData);
  },

  // Agregar acción manual
  addManualAction: async (incidentId: string, action: string, actor: string) => {
    const incidentRef = doc(db, 'incidents', incidentId);
    const incidentDoc = await getDoc(incidentRef);
    
    if (!incidentDoc.exists()) {
      throw new Error('Incident not found');
    }

    const currentData = incidentDoc.data();
    const currentManualActions = currentData.manualActions || [];
    const currentTimeline = currentData.timeline || [];

    const newTimelineEvent = {
      timestamp: serverTimestamp(),
      action: 'manual_action',
      actor: actor,
      description: action,
    };

    await updateDoc(incidentRef, {
      manualActions: [...currentManualActions, action],
      timeline: [...currentTimeline, newTimelineEvent],
      updatedAt: serverTimestamp(),
    });
  },

  // Agregar respuesta automatizada
  addAutomatedResponse: async (incidentId: string, response: string) => {
    const incidentRef = doc(db, 'incidents', incidentId);
    const incidentDoc = await getDoc(incidentRef);
    
    if (!incidentDoc.exists()) {
      throw new Error('Incident not found');
    }

    const currentData = incidentDoc.data();
    const currentAutomatedResponses = currentData.automatedResponses || [];
    const currentTimeline = currentData.timeline || [];

    const newTimelineEvent = {
      timestamp: serverTimestamp(),
      action: 'automated_response',
      actor: 'system',
      description: response,
    };

    await updateDoc(incidentRef, {
      automatedResponses: [...currentAutomatedResponses, response],
      timeline: [...currentTimeline, newTimelineEvent],
      updatedAt: serverTimestamp(),
    });
  },

  // Crear incidente desde alerta
  createFromAlert: async (alertId: string, alertData: Alert, actor: string): Promise<string> => {
    const incidentsCol = collection(db, 'incidents');
    
    const newIncident: any = {
      title: `Incidente: ${alertData.title}`,
      type: alertData.type,
      severity: alertData.severity,
      status: 'active' as IncidentStatus,
      affectedServers: [alertData.serverId],
      detectedAt: Timestamp.fromDate(alertData.timestamp),
      automatedResponses: [],
      manualActions: [],
      timeline: [
        {
          timestamp: serverTimestamp(),
          action: 'created',
          actor: actor,
          description: `Incidente creado desde alerta: ${alertData.title}`,
        },
        {
          timestamp: Timestamp.fromDate(alertData.timestamp),
          action: 'detected',
          actor: 'system',
          description: alertData.description,
        },
      ],
      createdBy: actor,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(incidentsCol, newIncident);
    return docRef.id;
  },
};

export default {
  servers: serversService,
  alerts: alertsService,
  threats: threatsService,
  stats: statsService,
  incidents: incidentsService,
};

