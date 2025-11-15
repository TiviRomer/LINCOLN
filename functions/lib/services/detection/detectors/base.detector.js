"use strict";
/**
 * Clase base para todos los detectores
 * Proporciona funcionalidades comunes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDetectorImpl = void 0;
const admin = require("firebase-admin");
class BaseDetectorImpl {
    /**
     * Obtiene las métricas del servidor desde Firestore
     * En un sistema real, esto vendría de un agente que monitorea el servidor
     * Ahora lee las métricas más recientes (últimos 5 minutos) para detectar ataques recientes
     */
    async getServerMetrics(serverId) {
        var _a;
        try {
            // Simplificado: siempre obtener la métrica más reciente sin filtro de tiempo
            // Esto es más confiable en emuladores y funciona mejor para pruebas
            console.log(`📊 BaseDetector: Obteniendo métrica más reciente para servidor ${serverId}...`);
            const latestDoc = await admin.firestore()
                .collection("servers")
                .doc(serverId)
                .collection("metrics")
                .orderBy("timestamp", "desc")
                .limit(1)
                .get();
            if (latestDoc.empty) {
                console.log(`   ❌ BaseDetector: No se encontraron métricas para servidor ${serverId}`);
                return null;
            }
            const data = latestDoc.docs[0].data();
            const metricId = latestDoc.docs[0].id;
            console.log(`   ✅ BaseDetector: Métrica encontrada: ${metricId}`);
            const mapped = this.mapMetricsData(data);
            // Verificar si la métrica es reciente (últimos 10 minutos)
            const metricAge = (Date.now() - mapped.timestamp.getTime()) / 1000 / 60; // minutos
            console.log(`      failedLoginAttempts: ${mapped.failedLoginAttempts}`);
            console.log(`      networkConnections: ${((_a = mapped.networkConnections) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
            console.log(`      timestamp: ${mapped.timestamp.toISOString()} (hace ${metricAge.toFixed(1)} minutos)`);
            if (metricAge > 10) {
                console.log(`      ⚠️  Métrica tiene más de 10 minutos de antigüedad, puede no ser relevante para detección actual`);
            }
            return mapped;
        }
        catch (error) {
            console.error(`❌ Error obteniendo métricas del servidor ${serverId}:`, error);
            return null;
        }
    }
    /**
     * Mapea los datos de Firestore a ServerMetrics
     */
    mapMetricsData(data) {
        var _a;
        return {
            cpuUsage: data.cpuUsage || 0,
            memoryUsage: data.memoryUsage || 0,
            diskUsage: data.diskUsage || 0,
            networkIn: data.networkIn || 0,
            networkOut: data.networkOut || 0,
            activeConnections: data.activeConnections || 0,
            failedLoginAttempts: data.failedLoginAttempts || 0,
            processes: (data.processes || []).map((proc) => {
                var _a;
                return (Object.assign(Object.assign({}, proc), { startTime: ((_a = proc.startTime) === null || _a === void 0 ? void 0 : _a.toDate) ? proc.startTime.toDate() : (proc.startTime || new Date()) }));
            }),
            fileChanges: (data.fileChanges || []).map((change) => {
                var _a;
                return (Object.assign(Object.assign({}, change), { timestamp: ((_a = change.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? change.timestamp.toDate() : (change.timestamp || new Date()) }));
            }),
            networkConnections: (data.networkConnections || []).map((conn) => {
                var _a;
                return (Object.assign(Object.assign({}, conn), { timestamp: ((_a = conn.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? conn.timestamp.toDate() : (conn.timestamp || new Date()) }));
            }),
            timestamp: ((_a = data.timestamp) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
        };
    }
    /**
     * Obtiene métricas históricas del servidor
     */
    async getHistoricalMetrics(serverId, hours = 24) {
        try {
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - hours);
            const metricsSnapshot = await admin.firestore()
                .collection("servers")
                .doc(serverId)
                .collection("metrics")
                .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(cutoffTime))
                .orderBy("timestamp", "asc")
                .get();
            return metricsSnapshot.docs.map((doc) => {
                var _a;
                const data = doc.data();
                return {
                    cpuUsage: data.cpuUsage || 0,
                    memoryUsage: data.memoryUsage || 0,
                    diskUsage: data.diskUsage || 0,
                    networkIn: data.networkIn || 0,
                    networkOut: data.networkOut || 0,
                    activeConnections: data.activeConnections || 0,
                    failedLoginAttempts: data.failedLoginAttempts || 0,
                    processes: (data.processes || []).map((proc) => {
                        var _a;
                        return (Object.assign(Object.assign({}, proc), { startTime: ((_a = proc.startTime) === null || _a === void 0 ? void 0 : _a.toDate) ? proc.startTime.toDate() : (proc.startTime || new Date()) }));
                    }),
                    fileChanges: (data.fileChanges || []).map((change) => {
                        var _a;
                        return (Object.assign(Object.assign({}, change), { timestamp: ((_a = change.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? change.timestamp.toDate() : (change.timestamp || new Date()) }));
                    }),
                    networkConnections: (data.networkConnections || []).map((conn) => {
                        var _a;
                        return (Object.assign(Object.assign({}, conn), { timestamp: ((_a = conn.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? conn.timestamp.toDate() : (conn.timestamp || new Date()) }));
                    }),
                    timestamp: ((_a = data.timestamp) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
                };
            });
        }
        catch (error) {
            console.error(`Error obteniendo métricas históricas del servidor ${serverId}:`, error);
            return [];
        }
    }
    /**
     * Calcula la severidad basada en la confianza y el tipo de amenaza
     */
    calculateSeverity(confidence, isCritical = false) {
        if (isCritical || confidence >= 90) {
            return "critical";
        }
        else if (confidence >= 70) {
            return "high";
        }
        else if (confidence >= 50) {
            return "medium";
        }
        else {
            return "low";
        }
    }
    /**
     * Registra un evento de detección en el log de auditoría
     */
    async logDetection(serverId, detectionType, result) {
        try {
            await admin.firestore().collection("audit_logs").add({
                action: "threat_detected",
                serverId,
                detectionType,
                threatDetected: result.threatDetected,
                severity: result.severity,
                confidence: result.confidence,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: result.metadata,
            });
        }
        catch (error) {
            console.error("Error registrando detección en log:", error);
        }
    }
}
exports.BaseDetectorImpl = BaseDetectorImpl;
//# sourceMappingURL=base.detector.js.map