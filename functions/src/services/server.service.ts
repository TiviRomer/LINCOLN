import * as admin from 'firebase-admin';
import { Server, serverConverter, CreateServer } from '../models/server.model';
import { DepartmentService } from './department.service';

export class ServerService {
  private static readonly collection = 'servers';
  private static readonly PING_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

  static async createServer(serverData: Omit<CreateServer, 'createdAt' | 'updatedAt' | 'isActive' | 'status'>): Promise<Server> {
    // Validate department exists
    const department = await DepartmentService.getDepartment(serverData.department);
    if (!department) {
      throw new Error('El departamento especificado no existe');
    }

    // Check for duplicate IP or hostname
    const [existingByIp, existingByHostname] = await Promise.all([
      this.getServerByIp(serverData.ipAddress),
      this.getServerByHostname(serverData.hostname)
    ]);

    if (existingByIp) {
      throw new Error('Ya existe un servidor con esta dirección IP');
    }

    if (existingByHostname) {
      throw new Error('Ya existe un servidor con este nombre de host');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const newServer: CreateServer = {
      ...serverData,
      isActive: true,
      status: 'offline', // Default status until first ping
      createdAt: now,
      updatedAt: now
    };

    const serverRef = await admin.firestore()
      .collection(this.collection)
      .withConverter(serverConverter)
      .add(newServer);

    const serverDoc = await serverRef.withConverter(serverConverter).get();
    const serverData = serverDoc.data();
    if (!serverData) {
      throw new Error('Error al crear el servidor');
    }
    // Create a new object with the id to satisfy the Server type
    return { ...serverData, id: serverDoc.id };
  }

  static async getServer(serverId: string): Promise<Server | null> {
    const serverDoc = await admin.firestore()
      .collection(this.collection)
      .doc(serverId)
      .withConverter(serverConverter)
      .get();

    const data = serverDoc.data();
    return data ? { ...data, id: serverDoc.id } : null;
  }

  static async getServerWithDetails(serverId: string): Promise<{
    server: Server;
    department: any;
    stats: {
      alertCount: number;
      activeAlerts: number;
      lastAlert?: any;
    };
  } | null> {
    const server = await this.getServer(serverId);
    if (!server) return null;

    const [department, alertStats] = await Promise.all([
      DepartmentService.getDepartment(server.department),
      this.getServerAlertStats(serverId)
    ]);

    return {
      server,
      department: department || null,
      stats: alertStats
    };
  }

  static async updateServer(
    serverId: string,
    data: Partial<Omit<Server, 'id' | 'createdAt'>>
  ): Promise<void> {
    if (data.department) {
      const department = await DepartmentService.getDepartment(data.department);
      if (!department) {
        throw new Error('El departamento especificado no existe');
      }
    }

    if (data.ipAddress || data.hostname) {
      const [existingByIp, existingByHostname] = await Promise.all([
        data.ipAddress ? this.getServerByIp(data.ipAddress) : null,
        data.hostname ? this.getServerByHostname(data.hostname) : null
      ]);

      if (existingByIp && existingByIp.id !== serverId) {
        throw new Error('Ya existe otro servidor con esta dirección IP');
      }

      if (existingByHostname && existingByHostname.id !== serverId) {
        throw new Error('Ya existe otro servidor con este nombre de host');
      }
    }

    await admin.firestore()
      .collection(this.collection)
      .doc(serverId)
      .withConverter(serverConverter)
      .set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
  }

  static async deactivateServer(serverId: string): Promise<void> {
    // Check if server has active alerts
    const AlertService = (await import('./alert.service')).AlertService;
    const activeAlerts = await AlertService.listAlerts({ 
      serverId,
      status: 'open'
    });

    if (activeAlerts.length > 0) {
      throw new Error('No se puede desactivar el servidor porque tiene alertas activas');
    }

    await this.updateServer(serverId, { 
      isActive: false,
      status: 'offline',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async activateServer(serverId: string): Promise<void> {
    await this.updateServer(serverId, { 
      isActive: true,
      status: 'offline', // Will update on next ping
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async deleteServer(serverId: string): Promise<void> {
    // Check if server has any alerts
    const AlertService = (await import('./alert.service')).AlertService;
    const alerts = await AlertService.listAlerts({ 
      serverId,
      limit: 1
    });

    if (alerts.length > 0) {
      throw new Error('No se puede eliminar el servidor porque tiene alertas asociadas');
    }

    await admin.firestore()
      .collection(this.collection)
      .doc(serverId)
      .delete();
  }

  static async getServerAlertStats(serverId: string): Promise<{
    alertCount: number;
    activeAlerts: number;
    lastAlert?: any;
  }> {
    const AlertService = (await import('./alert.service')).AlertService;
    const [allAlerts, openAlerts] = await Promise.all([
      AlertService.listAlerts({ serverId, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }),
      AlertService.listAlerts({ serverId, status: 'open' })
    ]);

    return {
      alertCount: allAlerts.length,
      activeAlerts: openAlerts.length,
      lastAlert: allAlerts[0] || null
    };
  }

  static async updateServerStatus(
    serverId: string, 
    status: 'online' | 'offline' | 'maintenance',
    metadata: {
      cpuUsage?: number;
      memoryUsage?: number;
      diskUsage?: number;
      uptime?: number;
    } = {}
  ): Promise<void> {
    const updateData: any = {
      status,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add metadata if provided
    if (metadata.cpuUsage !== undefined) updateData.lastCpuUsage = metadata.cpuUsage;
    if (metadata.memoryUsage !== undefined) updateData.lastMemoryUsage = metadata.memoryUsage;
    if (metadata.diskUsage !== undefined) updateData.lastDiskUsage = metadata.diskUsage;
    if (metadata.uptime !== undefined) updateData.lastUptime = metadata.uptime;

    await admin.firestore()
      .collection(this.collection)
      .doc(serverId)
      .update(updateData);
  }

  static async checkServerStatus(serverId: string): Promise<{
    status: 'online' | 'offline' | 'maintenance';
    lastSeen: admin.firestore.Timestamp | null;
    isActive: boolean;
  }> {
    const server = await this.getServer(serverId);
    if (!server) {
      throw new Error('Servidor no encontrado');
    }

    const now = Date.now();
    const lastSeen = server.lastSeen as admin.firestore.Timestamp;
    const lastSeenMs = lastSeen ? lastSeen.toMillis() : 0;

    const isOnline = server.status === 'online' && 
                    (now - lastSeenMs) < this.PING_TIMEOUT;

    return {
      status: isOnline ? 'online' : 'offline',
      lastSeen: lastSeen || null,
      isActive: server.isActive
    };
  }

  static async listServers(filters: {
    isActive?: boolean;
    environment?: string;
    department?: string;
    status?: 'online' | 'offline' | 'maintenance';
    searchTerm?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'status' | 'environment' | 'lastSeen';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    servers: Server[];
    total: number;
  }> {
    let query: admin.firestore.Query = admin.firestore()
      .collection(this.collection)
      .withConverter(serverConverter);

    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }
    if (filters.environment) {
      query = query.where('environment', '==', filters.environment);
    }
    if (filters.department) {
      query = query.where('department', '==', filters.department);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    // Get total count before applying pagination
    const countQuery = query;
    const totalSnapshot = await countQuery.count().get();
    const total = totalSnapshot.data().count;

    // Apply sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    let servers = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Server));

    // Apply search filter if provided
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      servers = servers.filter(server =>
        server.name.toLowerCase().includes(searchTerm) ||
        server.hostname.toLowerCase().includes(searchTerm) ||
        server.ipAddress.includes(searchTerm)
      );
    }

    return { servers, total };
  }

  static async getActiveServers(): Promise<Server[]> {
    const { servers } = await this.listServers({ isActive: true });
    return servers;
  }

  static async getServerByIp(ipAddress: string): Promise<Server | null> {
    const snapshot = await admin.firestore()
      .collection(this.collection)
      .where('ipAddress', '==', ipAddress)
      .withConverter(serverConverter)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return { ...data, id: doc.id };
  }

  static async getServerByHostname(hostname: string): Promise<Server | null> {
    const snapshot = await admin.firestore()
      .collection(this.collection)
      .where('hostname', '==', hostname.toLowerCase())
      .withConverter(serverConverter)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return { ...data, id: doc.id };
  }

  static async updateServerStatus(
    serverId: string,
    status: 'online' | 'offline' | 'maintenance',
    lastSeen?: Date
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (lastSeen) {
      updateData.lastSeen = admin.firestore.Timestamp.fromDate(lastSeen);
    }

    await this.updateServer(serverId, updateData);
  }
}
