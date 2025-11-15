"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerService = void 0;
const admin = require("firebase-admin");
const server_model_1 = require("../models/server.model");
const department_service_1 = require("./department.service");
class ServerService {
    static async createServer(serverData) {
        // Validate department exists
        const department = await department_service_1.DepartmentService.getDepartment(serverData.department);
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
        const newServer = Object.assign(Object.assign({}, serverData), { isActive: true, status: 'offline', createdAt: now, updatedAt: now });
        const serverRef = await admin.firestore()
            .collection(this.collection)
            .withConverter(server_model_1.serverConverter)
            .add(newServer);
        const serverDoc = await serverRef.withConverter(server_model_1.serverConverter).get();
        const serverData = serverDoc.data();
        if (!serverData) {
            throw new Error('Error al crear el servidor');
        }
        // Create a new object with the id to satisfy the Server type
        return Object.assign(Object.assign({}, serverData), { id: serverDoc.id });
    }
    static async getServer(serverId) {
        const serverDoc = await admin.firestore()
            .collection(this.collection)
            .doc(serverId)
            .withConverter(server_model_1.serverConverter)
            .get();
        const data = serverDoc.data();
        return data ? Object.assign(Object.assign({}, data), { id: serverDoc.id }) : null;
    }
    static async getServerWithDetails(serverId) {
        const server = await this.getServer(serverId);
        if (!server)
            return null;
        const [department, alertStats] = await Promise.all([
            department_service_1.DepartmentService.getDepartment(server.department),
            this.getServerAlertStats(serverId)
        ]);
        return {
            server,
            department: department || null,
            stats: alertStats
        };
    }
    static async updateServer(serverId, data) {
        if (data.department) {
            const department = await department_service_1.DepartmentService.getDepartment(data.department);
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
            .withConverter(server_model_1.serverConverter)
            .set(Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    }
    static async deactivateServer(serverId) {
        // Check if server has active alerts
        const AlertService = (await Promise.resolve().then(() => require('./alert.service'))).AlertService;
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
    static async activateServer(serverId) {
        await this.updateServer(serverId, {
            isActive: true,
            status: 'offline', // Will update on next ping
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async deleteServer(serverId) {
        // Check if server has any alerts
        const AlertService = (await Promise.resolve().then(() => require('./alert.service'))).AlertService;
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
    static async getServerAlertStats(serverId) {
        const AlertService = (await Promise.resolve().then(() => require('./alert.service'))).AlertService;
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
    static async updateServerStatus(serverId, status, metadata = {}) {
        const updateData = {
            status,
            lastSeen: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        // Add metadata if provided
        if (metadata.cpuUsage !== undefined)
            updateData.lastCpuUsage = metadata.cpuUsage;
        if (metadata.memoryUsage !== undefined)
            updateData.lastMemoryUsage = metadata.memoryUsage;
        if (metadata.diskUsage !== undefined)
            updateData.lastDiskUsage = metadata.diskUsage;
        if (metadata.uptime !== undefined)
            updateData.lastUptime = metadata.uptime;
        await admin.firestore()
            .collection(this.collection)
            .doc(serverId)
            .update(updateData);
    }
    static async checkServerStatus(serverId) {
        const server = await this.getServer(serverId);
        if (!server) {
            throw new Error('Servidor no encontrado');
        }
        const now = Date.now();
        const lastSeen = server.lastSeen;
        const lastSeenMs = lastSeen ? lastSeen.toMillis() : 0;
        const isOnline = server.status === 'online' &&
            (now - lastSeenMs) < this.PING_TIMEOUT;
        return {
            status: isOnline ? 'online' : 'offline',
            lastSeen: lastSeen || null,
            isActive: server.isActive
        };
    }
    static async listServers(filters = {}) {
        let query = admin.firestore()
            .collection(this.collection)
            .withConverter(server_model_1.serverConverter);
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
        let servers = snapshot.docs.map(doc => (Object.assign(Object.assign({}, doc.data()), { id: doc.id })));
        // Apply search filter if provided
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            servers = servers.filter(server => server.name.toLowerCase().includes(searchTerm) ||
                server.hostname.toLowerCase().includes(searchTerm) ||
                server.ipAddress.includes(searchTerm));
        }
        return { servers, total };
    }
    static async getActiveServers() {
        const { servers } = await this.listServers({ isActive: true });
        return servers;
    }
    static async getServerByIp(ipAddress) {
        const snapshot = await admin.firestore()
            .collection(this.collection)
            .where('ipAddress', '==', ipAddress)
            .withConverter(server_model_1.serverConverter)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        const data = doc.data();
        return Object.assign(Object.assign({}, data), { id: doc.id });
    }
    static async getServerByHostname(hostname) {
        const snapshot = await admin.firestore()
            .collection(this.collection)
            .where('hostname', '==', hostname.toLowerCase())
            .withConverter(server_model_1.serverConverter)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        const data = doc.data();
        return Object.assign(Object.assign({}, data), { id: doc.id });
    }
    static async updateServerStatus(serverId, status, lastSeen) {
        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (lastSeen) {
            updateData.lastSeen = admin.firestore.Timestamp.fromDate(lastSeen);
        }
        await this.updateServer(serverId, updateData);
    }
}
exports.ServerService = ServerService;
ServerService.collection = 'servers';
ServerService.PING_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
//# sourceMappingURL=server.service.js.map