"use strict";
/**
 * Servicio principal de detección de amenazas
 * Coordina todos los detectores y crea alertas automáticamente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectionService = void 0;
const admin = require("firebase-admin");
const alert_service_1 = require("../alert.service");
const server_service_1 = require("../server.service");
const ransomware_detector_1 = require("./detectors/ransomware.detector");
const intrusion_detector_1 = require("./detectors/intrusion.detector");
const data_leak_detector_1 = require("./detectors/data-leak.detector");
const anomaly_detector_1 = require("./detectors/anomaly.detector");
class DetectionService {
    constructor() {
        this.ransomwareDetector = new ransomware_detector_1.RansomwareDetector();
        this.intrusionDetector = new intrusion_detector_1.IntrusionDetector();
        this.dataLeakDetector = new data_leak_detector_1.DataLeakDetector();
        this.anomalyDetector = new anomaly_detector_1.AnomalyDetector();
    }
    /**
     * Ejecuta todas las detecciones para un servidor específico
     */
    async detectThreats(serverId, config = {}) {
        const server = await server_service_1.ServerService.getServer(serverId);
        if (!server || !server.isActive || server.status !== "online") {
            console.log(`⚠️  Servidor ${serverId} no está activo o no está online:`, {
                exists: !!server,
                isActive: server === null || server === void 0 ? void 0 : server.isActive,
                status: server === null || server === void 0 ? void 0 : server.status,
            });
            return [];
        }
        console.log(`✅ Servidor válido: ${server.name} (${server.id})`);
        const results = [];
        // Ejecutar detecciones según configuración
        if (config.enableRansomwareDetection !== false) {
            const ransomwareResults = await this.ransomwareDetector.detect(serverId, server);
            results.push(...ransomwareResults);
        }
        if (config.enableIntrusionDetection !== false) {
            const intrusionResults = await this.intrusionDetector.detect(serverId, server);
            results.push(...intrusionResults);
        }
        if (config.enableDataLeakPrevention !== false) {
            const dataLeakResults = await this.dataLeakDetector.detect(serverId, server);
            results.push(...dataLeakResults);
        }
        if (config.enableAnomalyDetection !== false) {
            const anomalyResults = await this.anomalyDetector.detect(serverId, server);
            results.push(...anomalyResults);
        }
        // Crear alertas para las amenazas detectadas
        for (const result of results) {
            if (result.threatDetected) {
                await this.createAlertFromDetection(result, server);
            }
        }
        return results;
    }
    /**
     * Ejecuta detecciones para todos los servidores activos
     */
    async detectThreatsForAllServers(config = {}) {
        console.log("🔍 Buscando servidores activos...");
        try {
            // Obtener todos los servidores activos primero
            const { servers: allServers } = await server_service_1.ServerService.listServers({ isActive: true });
            console.log(`📡 Servidores activos encontrados: ${allServers.length}`);
            if (allServers.length === 0) {
                console.log("⚠️  No se encontraron servidores activos");
                // Intentar obtener TODOS los servidores sin filtro
                const { servers: allServersNoFilter } = await server_service_1.ServerService.listServers({});
                console.log(`📡 Total de servidores en la base de datos: ${allServersNoFilter.length}`);
                if (allServersNoFilter.length > 0) {
                    console.log("   ⚠️  Hay servidores pero no están marcados como activos:");
                    allServersNoFilter.forEach((s, i) => {
                        console.log(`      ${i + 1}. ${s.name} (${s.id}) - isActive: ${s.isActive}, status: ${s.status}`);
                    });
                }
                return [];
            }
            // Filtrar solo los que están online (en memoria, para evitar problemas de índice)
            const servers = allServers.filter(s => s.status === "online");
            console.log(`📡 Servidores online encontrados: ${servers.length}`);
            if (servers.length === 0) {
                console.log("⚠️  No hay servidores online. Servidores activos encontrados:");
                allServers.forEach((s, i) => {
                    console.log(`   ${i + 1}. ${s.name} (${s.id}) - Status: ${s.status}, Active: ${s.isActive}`);
                });
                return [];
            }
            servers.forEach((s, i) => {
                console.log(`   ${i + 1}. ${s.name} (${s.id}) - Status: ${s.status}, Active: ${s.isActive}`);
            });
            const allResults = [];
            for (const server of servers) {
                try {
                    console.log(`🔍 Analizando servidor: ${server.name} (${server.id})`);
                    const results = await this.detectThreats(server.id, config);
                    console.log(`   Resultados para ${server.name}: ${results.length} detección(es)`);
                    results.forEach((r, i) => {
                        console.log(`      ${i + 1}. ${r.type} - ${r.title} - Threat: ${r.threatDetected}`);
                    });
                    allResults.push(...results);
                }
                catch (error) {
                    console.error(`❌ Error detectando amenazas en servidor ${server.id}:`, error.message);
                    console.error(`   Stack:`, error.stack);
                }
            }
            console.log(`✅ Total de resultados: ${allResults.length}`);
            const threats = allResults.filter(r => r.threatDetected);
            console.log(`🚨 Amenazas detectadas: ${threats.length}`);
            return allResults;
        }
        catch (error) {
            console.error(`❌ Error en detectThreatsForAllServers:`, error.message);
            console.error(`   Stack:`, error.stack);
            throw error;
        }
    }
    /**
     * Crea una alerta a partir de un resultado de detección
     */
    async createAlertFromDetection(result, server) {
        try {
            // Mapear tipo de detección a tipo de alerta
            const alertType = this.mapDetectionTypeToAlertType(result.type);
            await alert_service_1.AlertService.createAlert({
                title: result.title,
                description: result.description,
                severity: result.severity,
                type: alertType,
                serverId: server.id,
                serverName: server.name,
                source: "automated_detection",
                evidence: result.evidence,
                createdBy: "system",
            });
            console.log(`✅ Alerta creada: ${result.title} en servidor ${server.name}`);
        }
        catch (error) {
            console.error(`❌ Error al crear alerta desde detección:`, error);
        }
    }
    /**
     * Mapea el tipo de detección al tipo de alerta
     */
    mapDetectionTypeToAlertType(detectionType) {
        switch (detectionType) {
            case "ransomware":
                return "malware";
            case "intrusion":
                return "intrusion";
            case "data_leak":
                return "policy_violation";
            case "anomalous_behavior":
                return "other";
            default:
                return "other";
        }
    }
    /**
     * Obtiene la configuración de detección desde Firestore
     */
    async getDetectionConfig() {
        var _a, _b, _c, _d, _e, _f;
        try {
            const configDoc = await admin.firestore()
                .collection("config")
                .doc("detection")
                .get();
            if (configDoc.exists) {
                const data = configDoc.data();
                return {
                    enableRansomwareDetection: (_a = data === null || data === void 0 ? void 0 : data.enableRansomwareDetection) !== null && _a !== void 0 ? _a : true,
                    enableIntrusionDetection: (_b = data === null || data === void 0 ? void 0 : data.enableIntrusionDetection) !== null && _b !== void 0 ? _b : true,
                    enableDataLeakPrevention: (_c = data === null || data === void 0 ? void 0 : data.enableDataLeakPrevention) !== null && _c !== void 0 ? _c : true,
                    enableAnomalyDetection: (_d = data === null || data === void 0 ? void 0 : data.enableAnomalyDetection) !== null && _d !== void 0 ? _d : true,
                    suspiciousProcesses: (_e = data === null || data === void 0 ? void 0 : data.suspiciousProcesses) !== null && _e !== void 0 ? _e : ["crypt", "encrypt", "locky", "wannacry"],
                    detectionInterval: (_f = data === null || data === void 0 ? void 0 : data.detectionInterval) !== null && _f !== void 0 ? _f : 60, // segundos
                };
            }
        }
        catch (error) {
            console.error("Error obteniendo configuración de detección:", error);
        }
        // Configuración por defecto
        return {
            enableRansomwareDetection: true,
            enableIntrusionDetection: true,
            enableDataLeakPrevention: true,
            enableAnomalyDetection: true,
            suspiciousProcesses: ["crypt", "encrypt", "locky", "wannacry"],
            detectionInterval: 60,
        };
    }
}
exports.DetectionService = DetectionService;
//# sourceMappingURL=detection.service.js.map