"use strict";
/**
 * Detector de Filtraciones de Datos
 * Detecta transferencias masivas de datos, conexiones a destinos externos sospechosos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataLeakDetector = void 0;
const base_detector_1 = require("./base.detector");
class DataLeakDetector extends base_detector_1.BaseDetectorImpl {
    constructor() {
        super(...arguments);
        this.dataLeakThreshold = 100 * 1024 * 1024; // 100 MB
    }
    // private readonly suspiciousDomains = [
    //   "mega.nz", "dropbox.com", "google-drive", "onedrive",
    //   "wetransfer", "sendspace", "filehosting", "cloud-storage",
    // ]; // No usado actualmente
    async detect(serverId, _server) {
        const results = [];
        const metrics = await this.getServerMetrics(serverId);
        if (!metrics) {
            return results;
        }
        // Detectar transferencias masivas de datos
        const transferResult = await this.detectMassiveDataTransfer(serverId, metrics);
        if (transferResult) {
            results.push(transferResult);
        }
        // Detectar conexiones a servicios de almacenamiento en la nube
        const cloudStorageResult = this.detectCloudStorageConnections(serverId, metrics.networkConnections);
        if (cloudStorageResult) {
            results.push(cloudStorageResult);
        }
        // Detectar actividad de red inusual
        const unusualNetworkResult = await this.detectUnusualNetworkActivity(serverId, metrics);
        if (unusualNetworkResult) {
            results.push(unusualNetworkResult);
        }
        // Registrar detecciones
        for (const result of results) {
            await this.logDetection(serverId, "data_leak", result);
        }
        return results;
    }
    /**
     * Detecta transferencias masivas de datos salientes
     */
    async detectMassiveDataTransfer(serverId, metrics) {
        // Primero verificar si excede el umbral absoluto (100 MB)
        if (metrics.networkOut <= this.dataLeakThreshold) {
            return null;
        }
        // Obtener métricas históricas para comparar (excluyendo la actual)
        const historicalMetrics = await this.getHistoricalMetrics(serverId, 1); // Última hora
        // Si no hay métricas históricas o solo hay una, usar solo el umbral absoluto
        if (historicalMetrics.length === 0 || historicalMetrics.length === 1) {
            // Si excede el umbral absoluto, detectar directamente
            const dataInMB = (metrics.networkOut / (1024 * 1024)).toFixed(2);
            const confidence = Math.min(70 + (metrics.networkOut / this.dataLeakThreshold) * 5, 95);
            return {
                threatDetected: true,
                type: "data_leak",
                severity: this.calculateSeverity(confidence, metrics.networkOut > this.dataLeakThreshold * 5),
                title: "Posible Filtración de Datos Detectada",
                description: `Se detectó una transferencia masiva de ${dataInMB} MB de datos salientes, excediendo el umbral de 100 MB. Esto puede indicar una filtración de datos.`,
                evidence: JSON.stringify({
                    networkOut: metrics.networkOut,
                    threshold: this.dataLeakThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    dataTransferredMB: parseFloat(dataInMB),
                },
            };
        }
        // Calcular promedio de salida de datos en la última hora (excluyendo la actual)
        // Excluir la métrica más reciente para comparar con el promedio histórico
        const historicalWithoutCurrent = historicalMetrics
            .filter(m => m.timestamp.getTime() < metrics.timestamp.getTime())
            .slice(0, -1); // Excluir la más reciente
        if (historicalWithoutCurrent.length === 0) {
            // Si no hay métricas anteriores para comparar, usar solo umbral absoluto
            const dataInMB = (metrics.networkOut / (1024 * 1024)).toFixed(2);
            const confidence = Math.min(70 + (metrics.networkOut / this.dataLeakThreshold) * 5, 95);
            return {
                threatDetected: true,
                type: "data_leak",
                severity: this.calculateSeverity(confidence, metrics.networkOut > this.dataLeakThreshold * 5),
                title: "Posible Filtración de Datos Detectada",
                description: `Se detectó una transferencia masiva de ${dataInMB} MB de datos salientes, excediendo el umbral de 100 MB. Esto puede indicar una filtración de datos.`,
                evidence: JSON.stringify({
                    networkOut: metrics.networkOut,
                    threshold: this.dataLeakThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    dataTransferredMB: parseFloat(dataInMB),
                },
            };
        }
        const avgNetworkOut = historicalWithoutCurrent.reduce((sum, m) => sum + m.networkOut, 0) /
            historicalWithoutCurrent.length;
        // Si la salida actual es significativamente mayor que el promedio
        // O si excede el umbral absoluto (usar el mayor de los dos)
        const relativeThreshold = avgNetworkOut * 3; // 3x el promedio
        const absoluteThreshold = this.dataLeakThreshold; // 100 MB absoluto
        const threshold = Math.max(relativeThreshold, absoluteThreshold);
        if (metrics.networkOut > threshold) {
            const dataInMB = (metrics.networkOut / (1024 * 1024)).toFixed(2);
            const avgInMB = (avgNetworkOut / (1024 * 1024)).toFixed(2);
            const confidence = Math.min(70 + (metrics.networkOut / this.dataLeakThreshold) * 5, 95);
            return {
                threatDetected: true,
                type: "data_leak",
                severity: this.calculateSeverity(confidence, metrics.networkOut > this.dataLeakThreshold * 5),
                title: "Posible Filtración de Datos Detectada",
                description: `Se detectó una transferencia masiva de ${dataInMB} MB de datos salientes, significativamente mayor que el promedio de ${avgInMB} MB. Esto puede indicar una filtración de datos.`,
                evidence: JSON.stringify({
                    networkOut: metrics.networkOut,
                    averageNetworkOut: avgNetworkOut,
                    threshold: this.dataLeakThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    dataTransferredMB: parseFloat(dataInMB),
                    averageMB: parseFloat(avgInMB),
                },
            };
        }
        return null;
    }
    /**
     * Detecta conexiones a servicios de almacenamiento en la nube
     */
    detectCloudStorageConnections(serverId, connections) {
        // En un sistema real, esto haría una búsqueda DNS inversa o verificaría dominios
        // Por ahora, simulamos detectando conexiones a puertos HTTPS comunes
        const httpsConnections = connections.filter((conn) => conn.protocol === "tcp" &&
            (conn.remotePort === 443 || conn.remotePort === 80) &&
            !this.isPrivateIP(conn.remoteAddress));
        if (httpsConnections.length > 5) {
            const uniqueIPs = new Set(httpsConnections.map((c) => c.remoteAddress));
            const confidence = 65;
            return {
                threatDetected: true,
                type: "data_leak",
                severity: this.calculateSeverity(confidence),
                title: "Conexiones a Servicios Externos Detectadas",
                description: `Se detectaron ${httpsConnections.length} conexión(es) HTTPS a ${uniqueIPs.size} destino(s) externo(s). Verifica que estas conexiones sean legítimas y no representen una filtración de datos.`,
                evidence: JSON.stringify({
                    httpsConnections: httpsConnections.length,
                    uniqueDestinations: uniqueIPs.size,
                    sampleIPs: Array.from(uniqueIPs).slice(0, 5),
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    connectionCount: httpsConnections.length,
                    uniqueDestinationCount: uniqueIPs.size,
                },
            };
        }
        return null;
    }
    /**
     * Detecta actividad de red inusual (picos anómalos)
     */
    async detectUnusualNetworkActivity(serverId, metrics) {
        const historicalMetrics = await this.getHistoricalMetrics(serverId, 24); // Últimas 24 horas
        if (historicalMetrics.length < 10) {
            return null;
        }
        // Calcular estadísticas históricas
        const networkOutValues = historicalMetrics.map((m) => m.networkOut);
        const avg = networkOutValues.reduce((a, b) => a + b, 0) / networkOutValues.length;
        const variance = networkOutValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / networkOutValues.length;
        const stdDev = Math.sqrt(variance);
        // Si la actividad actual está más de 3 desviaciones estándar por encima del promedio
        const threshold = avg + (3 * stdDev);
        if (metrics.networkOut > threshold && metrics.networkOut > this.dataLeakThreshold / 2) {
            const dataInMB = (metrics.networkOut / (1024 * 1024)).toFixed(2);
            const confidence = 70;
            return {
                threatDetected: true,
                type: "data_leak",
                severity: this.calculateSeverity(confidence),
                title: "Actividad de Red Inusual Detectada",
                description: `Se detectó una actividad de red saliente inusual (${dataInMB} MB), significativamente mayor que el patrón histórico. Esto puede indicar una transferencia no autorizada de datos.`,
                evidence: JSON.stringify({
                    networkOut: metrics.networkOut,
                    average: avg,
                    standardDeviation: stdDev,
                    deviation: metrics.networkOut - avg,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    dataTransferredMB: parseFloat(dataInMB),
                    deviationFromAverage: metrics.networkOut - avg,
                },
            };
        }
        return null;
    }
    /**
     * Verifica si una IP es privada/local
     */
    isPrivateIP(ip) {
        const privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^127\./,
            /^::1$/,
            /^fe80:/,
        ];
        return privateRanges.some((range) => range.test(ip));
    }
}
exports.DataLeakDetector = DataLeakDetector;
//# sourceMappingURL=data-leak.detector.js.map