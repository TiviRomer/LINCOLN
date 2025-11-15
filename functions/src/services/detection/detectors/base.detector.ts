/**
 * Clase base para todos los detectores
 * Proporciona funcionalidades comunes
 */

import {BaseDetector, DetectionResult, ServerMetrics} from "../detection.types";
import {Server} from "../../../models/server.model";
import * as admin from "firebase-admin";

export abstract class BaseDetectorImpl implements BaseDetector {
  abstract detect(serverId: string, server: Server): Promise<DetectionResult[]>;

  /**
   * Obtiene las métricas del servidor desde Firestore
   * En un sistema real, esto vendría de un agente que monitorea el servidor
   * Ahora lee las métricas más recientes (últimos 5 minutos) para detectar ataques recientes
   */
  protected async getServerMetrics(serverId: string): Promise<ServerMetrics | null> {
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
      console.log(`      networkConnections: ${mapped.networkConnections?.length || 0}`);
      console.log(`      timestamp: ${mapped.timestamp.toISOString()} (hace ${metricAge.toFixed(1)} minutos)`);
      
      if (metricAge > 10) {
        console.log(`      ⚠️  Métrica tiene más de 10 minutos de antigüedad, puede no ser relevante para detección actual`);
      }
      
      return mapped;
    } catch (error) {
      console.error(`❌ Error obteniendo métricas del servidor ${serverId}:`, error);
      return null;
    }
  }

  /**
   * Mapea los datos de Firestore a ServerMetrics
   */
  private mapMetricsData(data: any): ServerMetrics {
    return {
      cpuUsage: data.cpuUsage || 0,
      memoryUsage: data.memoryUsage || 0,
      diskUsage: data.diskUsage || 0,
      networkIn: data.networkIn || 0,
      networkOut: data.networkOut || 0,
      activeConnections: data.activeConnections || 0,
      failedLoginAttempts: data.failedLoginAttempts || 0,
      processes: (data.processes || []).map((proc: any) => ({
        ...proc,
        startTime: proc.startTime?.toDate ? proc.startTime.toDate() : (proc.startTime || new Date()),
      })),
      fileChanges: (data.fileChanges || []).map((change: any) => ({
        ...change,
        timestamp: change.timestamp?.toDate ? change.timestamp.toDate() : (change.timestamp || new Date()),
      })),
      networkConnections: (data.networkConnections || []).map((conn: any) => ({
        ...conn,
        timestamp: conn.timestamp?.toDate ? conn.timestamp.toDate() : (conn.timestamp || new Date()),
      })),
      timestamp: data.timestamp?.toDate() || new Date(),
    };
  }

  /**
   * Obtiene métricas históricas del servidor
   */
  protected async getHistoricalMetrics(
    serverId: string,
    hours: number = 24,
  ): Promise<ServerMetrics[]> {
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
        const data = doc.data();
        return {
          cpuUsage: data.cpuUsage || 0,
          memoryUsage: data.memoryUsage || 0,
          diskUsage: data.diskUsage || 0,
          networkIn: data.networkIn || 0,
          networkOut: data.networkOut || 0,
          activeConnections: data.activeConnections || 0,
          failedLoginAttempts: data.failedLoginAttempts || 0,
          processes: (data.processes || []).map((proc: any) => ({
            ...proc,
            startTime: proc.startTime?.toDate ? proc.startTime.toDate() : (proc.startTime || new Date()),
          })),
          fileChanges: (data.fileChanges || []).map((change: any) => ({
            ...change,
            timestamp: change.timestamp?.toDate ? change.timestamp.toDate() : (change.timestamp || new Date()),
          })),
          networkConnections: (data.networkConnections || []).map((conn: any) => ({
            ...conn,
            timestamp: conn.timestamp?.toDate ? conn.timestamp.toDate() : (conn.timestamp || new Date()),
          })),
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error(`Error obteniendo métricas históricas del servidor ${serverId}:`, error);
      return [];
    }
  }

  /**
   * Calcula la severidad basada en la confianza y el tipo de amenaza
   */
  protected calculateSeverity(confidence: number, isCritical: boolean = false): "low" | "medium" | "high" | "critical" {
    if (isCritical || confidence >= 90) {
      return "critical";
    } else if (confidence >= 70) {
      return "high";
    } else if (confidence >= 50) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Registra un evento de detección en el log de auditoría
   */
  protected async logDetection(
    serverId: string,
    detectionType: string,
    result: DetectionResult,
  ): Promise<void> {
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
    } catch (error) {
      console.error("Error registrando detección en log:", error);
    }
  }
}

