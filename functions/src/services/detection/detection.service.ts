/**
 * Servicio principal de detección de amenazas
 * Coordina todos los detectores y crea alertas automáticamente
 */

import * as admin from "firebase-admin";
import {AlertService} from "../alert.service";
import {ServerService} from "../server.service";
import {RansomwareDetector} from "./detectors/ransomware.detector";
import {IntrusionDetector} from "./detectors/intrusion.detector";
import {DataLeakDetector} from "./detectors/data-leak.detector";
import {AnomalyDetector} from "./detectors/anomaly.detector";
import {DetectionResult, DetectionConfig} from "./detection.types";

export class DetectionService {
  private ransomwareDetector: RansomwareDetector;
  private intrusionDetector: IntrusionDetector;
  private dataLeakDetector: DataLeakDetector;
  private anomalyDetector: AnomalyDetector;

  constructor() {
    this.ransomwareDetector = new RansomwareDetector();
    this.intrusionDetector = new IntrusionDetector();
    this.dataLeakDetector = new DataLeakDetector();
    this.anomalyDetector = new AnomalyDetector();
  }

  /**
   * Ejecuta todas las detecciones para un servidor específico
   */
  async detectThreats(serverId: string, config: DetectionConfig = {}): Promise<DetectionResult[]> {
    const server = await ServerService.getServer(serverId);
    if (!server || !server.isActive || server.status !== "online") {
      console.log(`⚠️  Servidor ${serverId} no está activo o no está online:`, {
        exists: !!server,
        isActive: server?.isActive,
        status: server?.status,
      });
      return [];
    }

    console.log(`✅ Servidor válido: ${server.name} (${server.id})`);
    const results: DetectionResult[] = [];

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
  async detectThreatsForAllServers(config: DetectionConfig = {}): Promise<DetectionResult[]> {
    console.log("🔍 Buscando servidores activos...");
    
    try {
      // Obtener todos los servidores activos primero
      const {servers: allServers} = await ServerService.listServers({isActive: true});
      console.log(`📡 Servidores activos encontrados: ${allServers.length}`);
      
      if (allServers.length === 0) {
        console.log("⚠️  No se encontraron servidores activos");
        // Intentar obtener TODOS los servidores sin filtro
        const {servers: allServersNoFilter} = await ServerService.listServers({});
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

    const allResults: DetectionResult[] = [];

    for (const server of servers) {
      try {
        console.log(`🔍 Analizando servidor: ${server.name} (${server.id})`);
        const results = await this.detectThreats(server.id, config);
        console.log(`   Resultados para ${server.name}: ${results.length} detección(es)`);
        results.forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.type} - ${r.title} - Threat: ${r.threatDetected}`);
        });
        allResults.push(...results);
      } catch (error: any) {
        console.error(`❌ Error detectando amenazas en servidor ${server.id}:`, error.message);
        console.error(`   Stack:`, error.stack);
      }
    }

    console.log(`✅ Total de resultados: ${allResults.length}`);
    const threats = allResults.filter(r => r.threatDetected);
    console.log(`🚨 Amenazas detectadas: ${threats.length}`);
    return allResults;
    } catch (error: any) {
      console.error(`❌ Error en detectThreatsForAllServers:`, error.message);
      console.error(`   Stack:`, error.stack);
      throw error;
    }
  }

  /**
   * Crea una alerta a partir de un resultado de detección
   */
  private async createAlertFromDetection(
    result: DetectionResult,
    server: any,
  ): Promise<void> {
    try {
      // Mapear tipo de detección a tipo de alerta
      const alertType = this.mapDetectionTypeToAlertType(result.type);

      await AlertService.createAlert({
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
    } catch (error) {
      console.error(`❌ Error al crear alerta desde detección:`, error);
    }
  }

  /**
   * Mapea el tipo de detección al tipo de alerta
   */
  private mapDetectionTypeToAlertType(detectionType: string): "intrusion" | "malware" | "policy_violation" | "vulnerability" | "other" {
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
  async getDetectionConfig(): Promise<DetectionConfig> {
    try {
      const configDoc = await admin.firestore()
        .collection("config")
        .doc("detection")
        .get();

      if (configDoc.exists) {
        const data = configDoc.data();
        return {
          enableRansomwareDetection: data?.enableRansomwareDetection ?? true,
          enableIntrusionDetection: data?.enableIntrusionDetection ?? true,
          enableDataLeakPrevention: data?.enableDataLeakPrevention ?? true,
          enableAnomalyDetection: data?.enableAnomalyDetection ?? true,
          suspiciousProcesses: data?.suspiciousProcesses ?? ["crypt", "encrypt", "locky", "wannacry"],
          detectionInterval: data?.detectionInterval ?? 60, // segundos
        };
      }
    } catch (error) {
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

