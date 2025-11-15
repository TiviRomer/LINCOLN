"use strict";
/**
 * Detector de Comportamiento Anómalo
 * Detecta patrones inusuales en el uso de recursos, procesos y actividad del sistema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyDetector = void 0;
const base_detector_1 = require("./base.detector");
class AnomalyDetector extends base_detector_1.BaseDetectorImpl {
    constructor() {
        super(...arguments);
        this.cpuThreshold = 90; // Porcentaje
        this.memoryThreshold = 90; // Porcentaje
    }
    // private readonly diskThreshold = 95; // Porcentaje // No usado actualmente
    async detect(serverId, _server) {
        const results = [];
        const metrics = await this.getServerMetrics(serverId);
        if (!metrics) {
            return results;
        }
        // Detectar uso anómalo de CPU
        const cpuResult = await this.detectAnomalousCPU(serverId, metrics);
        if (cpuResult) {
            results.push(cpuResult);
        }
        // Detectar uso anómalo de memoria
        const memoryResult = await this.detectAnomalousMemory(serverId, metrics);
        if (memoryResult) {
            results.push(memoryResult);
        }
        // Detectar procesos con comportamiento inusual
        const processResult = this.detectAnomalousProcesses(serverId, metrics.processes);
        if (processResult) {
            results.push(processResult);
        }
        // Detectar actividad fuera de horario normal
        const offHoursResult = this.detectOffHoursActivity(serverId, metrics);
        if (offHoursResult) {
            results.push(offHoursResult);
        }
        // Detectar cambios en patrones de uso
        const patternResult = await this.detectUsagePatternChanges(serverId, metrics);
        if (patternResult) {
            results.push(patternResult);
        }
        // Registrar detecciones
        for (const result of results) {
            await this.logDetection(serverId, "anomalous_behavior", result);
        }
        return results;
    }
    /**
     * Detecta uso anómalo de CPU
     */
    async detectAnomalousCPU(serverId, metrics) {
        // Primero verificar umbral absoluto
        if (metrics.cpuUsage <= this.cpuThreshold) {
            return null;
        }
        const historicalMetrics = await this.getHistoricalMetrics(serverId, 24);
        // Si no hay métricas históricas o muy pocas, usar solo umbral absoluto
        if (historicalMetrics.length === 0 || historicalMetrics.length < 3) {
            const confidence = Math.min(70 + (metrics.cpuUsage - this.cpuThreshold) * 2, 90);
            return {
                threatDetected: true,
                type: "anomalous_behavior",
                severity: this.calculateSeverity(confidence, metrics.cpuUsage > 95),
                title: "Uso Anómalo de CPU Detectado",
                description: `El uso de CPU está en ${metrics.cpuUsage.toFixed(1)}%, excediendo el umbral de ${this.cpuThreshold}%. Esto puede indicar actividad maliciosa o un proceso no autorizado.`,
                evidence: JSON.stringify({
                    currentCpuUsage: metrics.cpuUsage,
                    threshold: this.cpuThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    cpuUsage: metrics.cpuUsage,
                },
            };
        }
        // Excluir la métrica actual del promedio histórico
        const historicalWithoutCurrent = historicalMetrics
            .filter(m => m.timestamp.getTime() < metrics.timestamp.getTime());
        if (historicalWithoutCurrent.length === 0) {
            // Si no hay métricas anteriores, usar solo umbral absoluto
            const confidence = Math.min(70 + (metrics.cpuUsage - this.cpuThreshold) * 2, 90);
            return {
                threatDetected: true,
                type: "anomalous_behavior",
                severity: this.calculateSeverity(confidence, metrics.cpuUsage > 95),
                title: "Uso Anómalo de CPU Detectado",
                description: `El uso de CPU está en ${metrics.cpuUsage.toFixed(1)}%, excediendo el umbral de ${this.cpuThreshold}%. Esto puede indicar actividad maliciosa o un proceso no autorizado.`,
                evidence: JSON.stringify({
                    currentCpuUsage: metrics.cpuUsage,
                    threshold: this.cpuThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    cpuUsage: metrics.cpuUsage,
                },
            };
        }
        const avgCpu = historicalWithoutCurrent.reduce((sum, m) => sum + m.cpuUsage, 0) /
            historicalWithoutCurrent.length;
        // Si el CPU está muy alto Y es significativamente mayor que el promedio
        // O si excede el umbral absoluto (usar el mayor de los dos criterios)
        const relativeThreshold = avgCpu * 1.5;
        const absoluteThreshold = this.cpuThreshold;
        const threshold = Math.max(relativeThreshold, absoluteThreshold);
        if (metrics.cpuUsage > threshold) {
            const confidence = Math.min(60 + (metrics.cpuUsage - avgCpu) / 2, 85);
            return {
                threatDetected: true,
                type: "anomalous_behavior",
                severity: this.calculateSeverity(confidence, metrics.cpuUsage > 95),
                title: "Uso Anómalo de CPU Detectado",
                description: `El uso de CPU está en ${metrics.cpuUsage.toFixed(1)}%, significativamente mayor que el promedio histórico de ${avgCpu.toFixed(1)}%. Esto puede indicar actividad maliciosa o un proceso no autorizado.`,
                evidence: JSON.stringify({
                    currentCpuUsage: metrics.cpuUsage,
                    averageCpuUsage: avgCpu,
                    threshold: this.cpuThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    cpuUsage: metrics.cpuUsage,
                    averageCpu: avgCpu,
                },
            };
        }
        return null;
    }
    /**
     * Detecta uso anómalo de memoria
     */
    async detectAnomalousMemory(serverId, metrics) {
        // Primero verificar umbral absoluto
        if (metrics.memoryUsage <= this.memoryThreshold) {
            return null;
        }
        const historicalMetrics = await this.getHistoricalMetrics(serverId, 24);
        // Si no hay métricas históricas o muy pocas, usar solo umbral absoluto
        if (historicalMetrics.length === 0 || historicalMetrics.length < 3) {
            const confidence = Math.min(70 + (metrics.memoryUsage - this.memoryThreshold) * 2, 90);
            return {
                threatDetected: true,
                type: "anomalous_behavior",
                severity: this.calculateSeverity(confidence, metrics.memoryUsage > 95),
                title: "Uso Anómalo de Memoria Detectado",
                description: `El uso de memoria está en ${metrics.memoryUsage.toFixed(1)}%, excediendo el umbral de ${this.memoryThreshold}%. Esto puede indicar un memory leak o actividad maliciosa.`,
                evidence: JSON.stringify({
                    currentMemoryUsage: metrics.memoryUsage,
                    threshold: this.memoryThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    memoryUsage: metrics.memoryUsage,
                },
            };
        }
        // Excluir la métrica actual del promedio histórico
        const historicalWithoutCurrent = historicalMetrics
            .filter(m => m.timestamp.getTime() < metrics.timestamp.getTime());
        if (historicalWithoutCurrent.length === 0) {
            // Si no hay métricas anteriores, usar solo umbral absoluto
            const confidence = Math.min(70 + (metrics.memoryUsage - this.memoryThreshold) * 2, 90);
            return {
                threatDetected: true,
                type: "anomalous_behavior",
                severity: this.calculateSeverity(confidence, metrics.memoryUsage > 95),
                title: "Uso Anómalo de Memoria Detectado",
                description: `El uso de memoria está en ${metrics.memoryUsage.toFixed(1)}%, excediendo el umbral de ${this.memoryThreshold}%. Esto puede indicar un memory leak o actividad maliciosa.`,
                evidence: JSON.stringify({
                    currentMemoryUsage: metrics.memoryUsage,
                    threshold: this.memoryThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    memoryUsage: metrics.memoryUsage,
                },
            };
        }
        const avgMemory = historicalWithoutCurrent.reduce((sum, m) => sum + m.memoryUsage, 0) /
            historicalWithoutCurrent.length;
        // Si la memoria está muy alta Y es significativamente mayor que el promedio
        // O si excede el umbral absoluto (usar el mayor de los dos criterios)
        const relativeThreshold = avgMemory * 1.5;
        const absoluteThreshold = this.memoryThreshold;
        const threshold = Math.max(relativeThreshold, absoluteThreshold);
        if (metrics.memoryUsage > threshold) {
            const confidence = Math.min(60 + (metrics.memoryUsage - avgMemory) / 2, 85);
            return {
                threatDetected: true,
                type: "anomalous_behavior",
                severity: this.calculateSeverity(confidence, metrics.memoryUsage > 95),
                title: "Uso Anómalo de Memoria Detectado",
                description: `El uso de memoria está en ${metrics.memoryUsage.toFixed(1)}%, significativamente mayor que el promedio histórico de ${avgMemory.toFixed(1)}%. Esto puede indicar un memory leak o actividad maliciosa.`,
                evidence: JSON.stringify({
                    currentMemoryUsage: metrics.memoryUsage,
                    averageMemoryUsage: avgMemory,
                    threshold: this.memoryThreshold,
                }),
                serverId,
                confidence,
                timestamp: new Date(),
                metadata: {
                    memoryUsage: metrics.memoryUsage,
                    averageMemory: avgMemory,
                },
            };
        }
        return null;
    }
    /**
     * Detecta procesos con comportamiento inusual
     */
    detectAnomalousProcesses(serverId, processes) {
        // Procesos consumiendo recursos excesivos
        const highResourceProcesses = processes.filter((proc) => proc.cpuUsage > 50 || proc.memoryUsage > 20);
        if (highResourceProcesses.length > 0) {
            const suspicious = highResourceProcesses.filter((proc) => {
                // Procesos con nombres genéricos o sospechosos
                const suspiciousNames = ["cmd", "powershell", "wscript", "cscript", "rundll32"];
                return suspiciousNames.some((name) => proc.name.toLowerCase().includes(name));
            });
            if (suspicious.length > 0) {
                const confidence = 70;
                return {
                    threatDetected: true,
                    type: "anomalous_behavior",
                    severity: this.calculateSeverity(confidence),
                    title: "Procesos con Comportamiento Inusual Detectados",
                    description: `Se detectaron ${suspicious.length} proceso(s) consumiendo recursos excesivos y con nombres sospechosos. Estos procesos pueden estar ejecutando código malicioso.`,
                    evidence: JSON.stringify({
                        processes: suspicious.map((p) => ({
                            pid: p.pid,
                            name: p.name,
                            cpuUsage: p.cpuUsage,
                            memoryUsage: p.memoryUsage,
                            command: p.command,
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
        }
        return null;
    }
    /**
     * Detecta actividad fuera de horario normal (horas no laborales)
     */
    detectOffHoursActivity(serverId, metrics) {
        const now = new Date();
        const hour = now.getHours();
        // Horario laboral: 8 AM - 6 PM, lunes a viernes
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        const isOffHours = isWeekend || hour < 8 || hour > 18;
        if (isOffHours) {
            // Si hay actividad significativa fuera de horario
            const hasSignificantActivity = metrics.cpuUsage > 30 ||
                metrics.activeConnections > 10 ||
                metrics.networkOut > 10 * 1024 * 1024; // 10 MB
            if (hasSignificantActivity) {
                const confidence = 60;
                return {
                    threatDetected: true,
                    type: "anomalous_behavior",
                    severity: this.calculateSeverity(confidence),
                    title: "Actividad Fuera de Horario Normal Detectada",
                    description: `Se detectó actividad significativa del sistema fuera del horario laboral normal. Esto puede indicar acceso no autorizado o actividad maliciosa.`,
                    evidence: JSON.stringify({
                        hour: hour,
                        isWeekend: isWeekend,
                        cpuUsage: metrics.cpuUsage,
                        activeConnections: metrics.activeConnections,
                        networkOut: metrics.networkOut,
                    }),
                    serverId,
                    confidence,
                    timestamp: new Date(),
                    metadata: {
                        hour: hour,
                        isWeekend: isWeekend,
                    },
                };
            }
        }
        return null;
    }
    /**
     * Detecta cambios significativos en patrones de uso
     */
    async detectUsagePatternChanges(serverId, metrics) {
        const historicalMetrics = await this.getHistoricalMetrics(serverId, 7 * 24); // Última semana
        if (historicalMetrics.length < 50) {
            return null;
        }
        // Calcular promedios por hora del día (última semana)
        const hourlyAverages = new Map();
        historicalMetrics.forEach((m) => {
            const hour = m.timestamp.getHours();
            if (!hourlyAverages.has(hour)) {
                hourlyAverages.set(hour, []);
            }
            hourlyAverages.get(hour).push(m.cpuUsage);
        });
        const currentHour = new Date().getHours();
        const currentHourAvg = hourlyAverages.get(currentHour);
        if (currentHourAvg && currentHourAvg.length > 0) {
            const avgForHour = currentHourAvg.reduce((a, b) => a + b, 0) / currentHourAvg.length;
            const variance = currentHourAvg.reduce((sum, val) => sum + Math.pow(val - avgForHour, 2), 0) / currentHourAvg.length;
            const stdDev = Math.sqrt(variance);
            // Si el uso actual está más de 2 desviaciones estándar por encima del promedio para esta hora
            if (metrics.cpuUsage > avgForHour + (2 * stdDev) && metrics.cpuUsage > 50) {
                const confidence = 65;
                return {
                    threatDetected: true,
                    type: "anomalous_behavior",
                    severity: this.calculateSeverity(confidence),
                    title: "Cambio en Patrón de Uso Detectado",
                    description: `El uso actual de recursos (CPU: ${metrics.cpuUsage.toFixed(1)}%) es significativamente mayor que el patrón histórico para esta hora del día (promedio: ${avgForHour.toFixed(1)}%). Esto puede indicar actividad anómala.`,
                    evidence: JSON.stringify({
                        currentCpuUsage: metrics.cpuUsage,
                        averageForHour: avgForHour,
                        standardDeviation: stdDev,
                        hour: currentHour,
                    }),
                    serverId,
                    confidence,
                    timestamp: new Date(),
                    metadata: {
                        cpuUsage: metrics.cpuUsage,
                        averageForHour: avgForHour,
                        hour: currentHour,
                    },
                };
            }
        }
        return null;
    }
}
exports.AnomalyDetector = AnomalyDetector;
//# sourceMappingURL=anomaly.detector.js.map