"use strict";
/**
 * Detector de Ransomware
 * Detecta patrones sospechosos de encriptación y procesos maliciosos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RansomwareDetector = void 0;
const base_detector_1 = require("./base.detector");
// import * as admin from "firebase-admin"; // No usado actualmente
class RansomwareDetector extends base_detector_1.BaseDetectorImpl {
    constructor() {
        super(...arguments);
        this.suspiciousProcesses = [
            "crypt", "encrypt", "locky", "wannacry", "petya", "notpetya",
            "cerber", "lockbit", "revil", "maze", "ryuk", "sodinokibi",
            "crypto", "ransom", "encrypted", "locked",
        ];
        this.suspiciousExtensions = [
            ".encrypted", ".locked", ".crypto", ".vault", ".ecc", ".ezz",
            ".exx", ".zzz", ".xyz", ".aaa", ".micro", ".dharma", ".cry",
        ];
    }
    async detect(serverId, _server) {
        const results = [];
        const metrics = await this.getServerMetrics(serverId);
        if (!metrics) {
            return results;
        }
        // Detectar procesos sospechosos
        const processResult = this.detectSuspiciousProcesses(serverId, metrics.processes);
        if (processResult) {
            results.push(processResult);
        }
        // Detectar patrones de encriptación masiva
        const encryptionResult = this.detectMassEncryption(serverId, metrics.fileChanges);
        if (encryptionResult) {
            results.push(encryptionResult);
        }
        // Detectar actividad de CPU alta con cambios de archivos
        const cpuFileResult = this.detectHighCpuWithFileChanges(serverId, metrics);
        if (cpuFileResult) {
            results.push(cpuFileResult);
        }
        // Registrar detecciones
        for (const result of results) {
            await this.logDetection(serverId, "ransomware", result);
        }
        return results;
    }
    /**
     * Detecta procesos sospechosos relacionados con ransomware
     */
    detectSuspiciousProcesses(serverId, processes) {
        const suspicious = processes.filter((proc) => {
            const procName = proc.name.toLowerCase();
            return this.suspiciousProcesses.some((susp) => procName.includes(susp));
        });
        if (suspicious.length === 0) {
            return null;
        }
        const suspiciousNames = suspicious.map((p) => p.name).join(", ");
        const confidence = Math.min(85 + suspicious.length * 5, 100);
        return {
            threatDetected: true,
            type: "ransomware",
            severity: this.calculateSeverity(confidence, true),
            title: "Proceso Sospechoso de Ransomware Detectado",
            description: `Se detectaron ${suspicious.length} proceso(s) sospechoso(s) ejecutándose: ${suspiciousNames}. Estos procesos pueden estar relacionados con actividad de ransomware.`,
            evidence: JSON.stringify({
                processes: suspicious.map((p) => ({
                    pid: p.pid,
                    name: p.name,
                    command: p.command,
                    user: p.user,
                })),
            }),
            serverId,
            confidence,
            timestamp: new Date(),
            metadata: {
                suspiciousProcessCount: suspicious.length,
                processNames: suspicious.map((p) => p.name),
            },
        };
    }
    /**
     * Detecta patrones de encriptación masiva de archivos
     */
    detectMassEncryption(serverId, fileChanges) {
        // Filtrar cambios recientes (últimos 5 minutos)
        const recentChanges = fileChanges.filter((change) => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return change.timestamp >= fiveMinutesAgo;
        });
        if (recentChanges.length < 10) {
            return null;
        }
        // Contar archivos con extensiones sospechosas
        const suspiciousExtensions = recentChanges.filter((change) => {
            return this.suspiciousExtensions.some((ext) => change.path.toLowerCase().endsWith(ext));
        });
        // Si hay muchos cambios recientes o extensiones sospechosas
        if (recentChanges.length > 50 || suspiciousExtensions.length > 5) {
            const confidence = Math.min(70 + (recentChanges.length / 10) * 2, 95);
            return {
                threatDetected: true,
                type: "ransomware",
                severity: this.calculateSeverity(confidence, recentChanges.length > 100),
                title: "Posible Encriptación Masiva de Archivos Detectada",
                description: `Se detectaron ${recentChanges.length} cambios de archivos en los últimos 5 minutos. ${suspiciousExtensions.length > 0 ? `Además, se encontraron ${suspiciousExtensions.length} archivos con extensiones sospechosas de ransomware.` : ""} Esto puede indicar una actividad de encriptación masiva.`,
                evidence: JSON.stringify({
                    totalFileChanges: recentChanges.length,
                    suspiciousExtensions: suspiciousExtensions.length,
                    samplePaths: recentChanges.slice(0, 10).map((c) => c.path),
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    fileChangeCount: recentChanges.length,
                    suspiciousExtensionCount: suspiciousExtensions.length,
                },
            };
        }
        return null;
    }
    /**
     * Detecta alta actividad de CPU combinada con cambios masivos de archivos
     */
    detectHighCpuWithFileChanges(serverId, metrics) {
        var _a;
        const highCpu = metrics.cpuUsage > 80;
        const manyFileChanges = ((_a = metrics.fileChanges) === null || _a === void 0 ? void 0 : _a.length) > 20;
        if (highCpu && manyFileChanges) {
            const confidence = 75;
            return {
                threatDetected: true,
                type: "ransomware",
                severity: this.calculateSeverity(confidence),
                title: "Actividad Sospechosa: Alta CPU con Cambios Masivos de Archivos",
                description: `Se detectó un uso de CPU del ${metrics.cpuUsage.toFixed(1)}% junto con ${metrics.fileChanges.length} cambios de archivos recientes. Esta combinación puede indicar actividad de ransomware encriptando archivos.`,
                evidence: JSON.stringify({
                    cpuUsage: metrics.cpuUsage,
                    fileChangeCount: metrics.fileChanges.length,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    cpuUsage: metrics.cpuUsage,
                    fileChangeCount: metrics.fileChanges.length,
                },
            };
        }
        return null;
    }
}
exports.RansomwareDetector = RansomwareDetector;
//# sourceMappingURL=ransomware.detector.js.map