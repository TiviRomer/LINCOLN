"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const admin = require("firebase-admin");
const alert_model_1 = require("../models/alert.model");
const user_service_1 = require("./user.service");
const server_service_1 = require("./server.service");
class AlertService {
    static async createAlert(alertData) {
        const now = admin.firestore.FieldValue.serverTimestamp();
        const newAlert = Object.assign(Object.assign({}, alertData), { status: 'open', assignedTo: null, createdAt: now, updatedAt: now });
        const alertRef = await admin.firestore()
            .collection(this.collection)
            .withConverter(alert_model_1.alertConverter)
            .add(newAlert);
        const alertDoc = await alertRef.withConverter(alert_model_1.alertConverter).get();
        const alert = alertDoc.data();
        if (!alert) {
            throw new Error('Error al crear la alerta');
        }
        return alert;
    }
    static async getAlert(alertId) {
        const alertDoc = await admin.firestore()
            .collection(this.collection)
            .doc(alertId)
            .withConverter(alert_model_1.alertConverter)
            .get();
        return alertDoc.data() || null;
    }
    static async updateAlert(alertId, data) {
        await admin.firestore()
            .collection(this.collection)
            .doc(alertId)
            .withConverter(alert_model_1.alertConverter)
            .set(Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    }
    static async assignAlert(alertId, userId) {
        const user = await user_service_1.UserService.getUser(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        await this.updateAlert(alertId, {
            assignedTo: userId,
            status: 'acknowledged',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async acknowledgeAlert(alertId, userId) {
        await this.updateAlert(alertId, {
            acknowledgedBy: userId,
            acknowledgedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'in_progress',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async closeAlert(alertId, resolution) {
        await this.updateAlert(alertId, {
            status: 'closed',
            resolution,
            closedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async addComment(alertId, userId, comment) {
        const commentData = {
            userId,
            comment,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await admin.firestore()
            .collection(this.collection)
            .doc(alertId)
            .update({
            comments: admin.firestore.FieldValue.arrayUnion(commentData),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async getAlertWithServer(alertId) {
        const alert = await this.getAlert(alertId);
        if (!alert)
            return null;
        const server = await server_service_1.ServerService.getServer(alert.serverId);
        if (!server)
            return null;
        return { alert, server };
    }
    static async listAlerts(filters = {}) {
        let query = admin.firestore()
            .collection(this.collection)
            .withConverter(alert_model_1.alertConverter);
        if (filters.serverId) {
            query = query.where('serverId', '==', filters.serverId);
        }
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters.severity) {
            query = query.where('severity', '==', filters.severity);
        }
        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.assignedTo !== undefined) {
            query = query.where('assignedTo', '==', filters.assignedTo);
        }
        if (filters.createdBy) {
            query = query.where('createdBy', '==', filters.createdBy);
        }
        if (filters.startDate) {
            query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(filters.startDate));
        }
        if (filters.endDate) {
            query = query.where('createdAt', '<=', admin.firestore.Timestamp.fromDate(filters.endDate));
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        query = query.orderBy('createdAt', 'desc');
        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data());
    }
    static async getAlertsForServer(serverId, limit = 50) {
        return this.listAlerts({
            serverId,
            limit,
            status: 'open'
        });
    }
    static async getAlertStats(timeRange = '7d') {
        const now = new Date();
        let startDate = new Date();
        switch (timeRange) {
            case '24h':
                startDate.setDate(now.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'all':
                startDate = new Date(0); // Época Unix
                break;
        }
        const alerts = await this.listAlerts({
            startDate,
            endDate: now
        });
        const stats = {
            total: alerts.length,
            byStatus: {},
            bySeverity: {},
            byType: {},
            byServer: {},
            createdAt: admin.firestore.Timestamp.now()
        };
        // Contar por estado, severidad, tipo y servidor
        alerts.forEach(alert => {
            stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1;
            stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
            stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
            stats.byServer[alert.serverId] = (stats.byServer[alert.serverId] || 0) + 1;
        });
        return stats;
    }
    static async getAlertTrends(days = 30) {
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);
        const alerts = await this.listAlerts({
            startDate,
            endDate: now
        });
        // Agrupar por día
        const dailyTrends = {};
        alerts.forEach(alert => {
            if (!alert.createdAt)
                return;
            const date = alert.createdAt.toDate();
            const dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            if (!dailyTrends[dateStr]) {
                dailyTrends[dateStr] = { date: dateStr, count: 0 };
            }
            dailyTrends[dateStr].count++;
        });
        // Convertir a array y ordenar por fecha
        return Object.values(dailyTrends).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    static async getAlertSummary(serverId) {
        const now = new Date();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(now.getDate() - 1);
        const [total, last24h, byStatus, bySeverity] = await Promise.all([
            serverId
                ? this.listAlerts({ serverId })
                : this.listAlerts(),
            this.listAlerts(Object.assign({ startDate: oneDayAgo, endDate: now }, (serverId && { serverId }))),
            serverId
                ? this.listAlerts({ serverId })
                : this.listAlerts(),
            serverId
                ? this.listAlerts({ serverId })
                : this.listAlerts()
        ]);
        return {
            total: total.length,
            last24h: last24h.length,
            byStatus: this.countBy(byStatus, 'status'),
            bySeverity: this.countBy(bySeverity, 'severity'),
            updatedAt: admin.firestore.Timestamp.now()
        };
    }
    static countBy(items, key) {
        return items.reduce((acc, item) => {
            const value = String(item[key]);
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
    static async escalateAlert(alertId, newSeverity, reason) {
        const alert = await this.getAlert(alertId);
        if (!alert) {
            throw new Error('Alerta no encontrada');
        }
        await this.updateAlert(alertId, {
            severity: newSeverity,
            escalation: {
                previousSeverity: alert.severity,
                reason,
                escalatedAt: admin.firestore.FieldValue.serverTimestamp(),
                escalatedBy: admin.firestore.FieldValue.serverTimestamp()
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async getAlertsByUser(userId, filters = {}) {
        return this.listAlerts(Object.assign({ assignedTo: userId }, filters));
    }
    static async getRecentAlerts(limit = 10) {
        return this.listAlerts({
            limit,
            status: 'open'
        });
    }
}
exports.AlertService = AlertService;
AlertService.collection = 'alerts';
//# sourceMappingURL=alert.service.js.map