"use strict";
/**
 * Detector de Intrusiones
 * Detecta intentos de acceso no autorizado, escaneos de puertos y conexiones sospechosas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntrusionDetector = void 0;
const base_detector_1 = require("./base.detector");
class IntrusionDetector extends base_detector_1.BaseDetectorImpl {
    constructor() {
        super(...arguments);
        this.suspiciousPorts = [22, 23, 3389, 5900, 1433, 3306, 5432]; // SSH, Telnet, RDP, VNC, SQL
        this.maxFailedLogins = 5; // Intentos fallidos antes de alertar
    }
    async detect(serverId, _server) {
        var _a, _b;
        const results = [];
        const metrics = await this.getServerMetrics(serverId);
        if (!metrics) {
            console.log(`⚠️  IntrusionDetector: No se encontraron métricas para servidor ${serverId}`);
            return results;
        }
        console.log(`📊 IntrusionDetector: Métricas obtenidas para servidor ${serverId}:`);
        console.log(`   failedLoginAttempts: ${metrics.failedLoginAttempts}`);
        console.log(`   networkConnections: ${((_a = metrics.networkConnections) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
        console.log(`   timestamp: ${metrics.timestamp.toISOString()}`);
        // Detectar múltiples intentos de login fallidos
        const failedLoginResult = this.detectFailedLoginAttempts(serverId, metrics);
        if (failedLoginResult) {
            console.log(`🚨 IntrusionDetector: Detección de login fallidos - ${failedLoginResult.title}`);
            results.push(failedLoginResult);
        }
        else {
            console.log(`   ℹ️  IntrusionDetector: No se detectó intentos de login fallidos (${metrics.failedLoginAttempts} intentos)`);
        }
        // Detectar conexiones sospechosas
        const suspiciousConnectionResult = this.detectSuspiciousConnections(serverId, metrics.networkConnections);
        if (suspiciousConnectionResult) {
            console.log(`🚨 IntrusionDetector: Detección de conexiones sospechosas - ${suspiciousConnectionResult.title}`);
            results.push(suspiciousConnectionResult);
        }
        else {
            console.log(`   ℹ️  IntrusionDetector: No se detectaron conexiones sospechosas (${((_b = metrics.networkConnections) === null || _b === void 0 ? void 0 : _b.length) || 0} conexiones)`);
        }
        // Detectar escaneo de puertos
        const portScanResult = this.detectPortScanning(serverId, metrics.networkConnections);
        if (portScanResult) {
            results.push(portScanResult);
        }
        // Detectar conexiones desde IPs desconocidas
        const unknownIpResult = this.detectUnknownIPs(serverId, metrics.networkConnections);
        if (unknownIpResult) {
            results.push(unknownIpResult);
        }
        // Registrar detecciones
        for (const result of results) {
            await this.logDetection(serverId, "intrusion", result);
        }
        return results;
    }
    /**
     * Detecta múltiples intentos de login fallidos
     */
    detectFailedLoginAttempts(serverId, metrics) {
        const failedLogins = metrics.failedLoginAttempts || 0;
        console.log(`   🔍 IntrusionDetector.detectFailedLoginAttempts: ${failedLogins} intentos fallidos (umbral: ${this.maxFailedLogins})`);
        if (failedLogins < this.maxFailedLogins) {
            console.log(`   ℹ️  IntrusionDetector: No se detecta (${failedLogins} < ${this.maxFailedLogins})`);
            return null;
        }
        console.log(`   🚨 IntrusionDetector: DETECTADO ${failedLogins} intentos fallidos (>= ${this.maxFailedLogins})`);
        const confidence = Math.min(60 + metrics.failedLoginAttempts * 5, 95);
        return {
            threatDetected: true,
            type: "intrusion",
            severity: this.calculateSeverity(confidence, metrics.failedLoginAttempts > 10),
            title: "Múltiples Intentos de Login Fallidos Detectados",
            description: `Se detectaron ${metrics.failedLoginAttempts} intentos de inicio de sesión fallidos. Esto puede indicar un intento de fuerza bruta o acceso no autorizado.`,
            evidence: JSON.stringify({
                failedLoginAttempts: metrics.failedLoginAttempts,
                threshold: this.maxFailedLogins,
            }),
            serverId,
            confidence,
            timestamp: new Date(),
            metadata: {
                failedLoginAttempts: metrics.failedLoginAttempts,
            },
        };
    }
    /**
     * Detecta conexiones sospechosas (puertos no estándar, IPs desconocidas)
     */
    detectSuspiciousConnections(serverId, connections) {
        const suspicious = connections.filter((conn) => {
            // Conexiones a puertos sospechosos
            const isSuspiciousPort = this.suspiciousPorts.includes(conn.localPort);
            // Conexiones en estados sospechosos
            const suspiciousStates = ["SYN_SENT", "FIN_WAIT", "CLOSE_WAIT"];
            const isSuspiciousState = suspiciousStates.includes(conn.state);
            // Detectar si:
            // 1. El puerto está en la lista sospechosa (SSH, RDP, etc.)
            // 2. O si está en estado sospechoso (SYN_SENT, FIN_WAIT, CLOSE_WAIT)
            return isSuspiciousPort || isSuspiciousState;
        });
        if (suspicious.length === 0) {
            return null;
        }
        const confidence = Math.min(65 + suspicious.length * 3, 90);
        return {
            threatDetected: true,
            type: "intrusion",
            severity: this.calculateSeverity(confidence),
            title: "Conexiones Sospechosas Detectadas",
            description: `Se detectaron ${suspicious.length} conexión(es) sospechosa(s) al servidor. Estas conexiones pueden indicar intentos de intrusión o acceso no autorizado.`,
            evidence: JSON.stringify({
                suspiciousConnections: suspicious.map((c) => ({
                    protocol: c.protocol,
                    localPort: c.localPort,
                    remoteAddress: c.remoteAddress,
                    remotePort: c.remotePort,
                    state: c.state,
                })),
            }),
            serverId,
            confidence,
            timestamp: new Date(),
            metadata: {
                suspiciousConnectionCount: suspicious.length,
            },
        };
    }
    /**
     * Detecta escaneo de puertos (múltiples conexiones a diferentes puertos desde la misma IP)
     */
    detectPortScanning(serverId, connections) {
        // Agrupar conexiones por IP remota
        const connectionsByIP = new Map();
        connections.forEach((conn) => {
            if (!connectionsByIP.has(conn.remoteAddress)) {
                connectionsByIP.set(conn.remoteAddress, []);
            }
            connectionsByIP.get(conn.remoteAddress).push(conn);
        });
        // Buscar IPs con múltiples conexiones a diferentes puertos
        for (const [ip, conns] of connectionsByIP.entries()) {
            if (this.isPrivateIP(ip))
                continue; // Ignorar IPs privadas (pueden ser legítimas)
            const uniquePorts = new Set(conns.map((c) => c.localPort));
            if (uniquePorts.size >= 5 && conns.length >= 10) {
                const confidence = Math.min(70 + uniquePorts.size * 2, 95);
                return {
                    threatDetected: true,
                    type: "intrusion",
                    severity: this.calculateSeverity(confidence, uniquePorts.size > 10),
                    title: "Posible Escaneo de Puertos Detectado",
                    description: `Se detectaron ${conns.length} conexiones desde la IP ${ip} a ${uniquePorts.size} puertos diferentes. Esto puede indicar un escaneo de puertos o intento de intrusión.`,
                    evidence: JSON.stringify({
                        sourceIP: ip,
                        connectionCount: conns.length,
                        uniquePorts: Array.from(uniquePorts),
                    }),
                    serverId,
                    confidence,
                    timestamp: new Date(),
                    metadata: {
                        sourceIP: ip,
                        connectionCount: conns.length,
                        uniquePortCount: uniquePorts.size,
                    },
                };
            }
        }
        return null;
    }
    /**
     * Detecta conexiones desde IPs desconocidas o no autorizadas
     */
    detectUnknownIPs(serverId, connections) {
        // En un sistema real, esto compararía con una lista de IPs autorizadas
        // Por ahora, detectamos IPs externas que no son privadas
        const externalIPs = connections
            .filter((conn) => !this.isPrivateIP(conn.remoteAddress))
            .map((conn) => conn.remoteAddress);
        const uniqueExternalIPs = new Set(externalIPs);
        if (uniqueExternalIPs.size > 3) {
            const confidence = 60;
            return {
                threatDetected: true,
                type: "intrusion",
                severity: this.calculateSeverity(confidence),
                title: "Conexiones desde IPs Externas Detectadas",
                description: `Se detectaron conexiones desde ${uniqueExternalIPs.size} IP(s) externa(s) diferentes. Verifica que estas conexiones sean legítimas.`,
                evidence: JSON.stringify({
                    externalIPs: Array.from(uniqueExternalIPs),
                    totalConnections: externalIPs.length,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    externalIPCount: uniqueExternalIPs.size,
                },
            };
        }
        return null;
    }
    /**
     * Verifica si una IP es privada/local
     */
    isPrivateIP(ip) {
        // Rangos de IPs privadas
        const privateRanges = [
            /^10\./, // 10.0.0.0/8
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
            /^192\.168\./, // 192.168.0.0/16
            /^127\./, // localhost
            /^::1$/, // IPv6 localhost
            /^fe80:/, // IPv6 link-local
        ];
        return privateRanges.some((range) => range.test(ip));
    }
}
exports.IntrusionDetector = IntrusionDetector;
//# sourceMappingURL=intrusion.detector.js.map