/**
 * Scheduler para ejecutar detecciones periódicamente
 */

import * as functions from "firebase-functions/v1";
import {DetectionService} from "./detection.service";

const detectionService = new DetectionService();

/**
 * Función programada que ejecuta detecciones cada minuto
 * En producción, puedes cambiar el intervalo según tus necesidades
 */
export const runDetectionScheduled = functions.pubsub
  .schedule("every 1 minutes")
  .timeZone("America/New_York")
  .onRun(async (_context) => {
    console.log("🔍 Iniciando detección programada de amenazas...");

    try {
      const config = await detectionService.getDetectionConfig();

      // Ejecutar detecciones para todos los servidores
      const results = await detectionService.detectThreatsForAllServers(config);

      const threatsDetected = results.filter((r) => r.threatDetected).length;
      const totalDetections = results.length;

      console.log(
        `✅ Detección completada: ${threatsDetected} amenaza(s) detectada(s) ` +
        `de ${totalDetections} detección(es) realizadas`,
      );

      return {
        success: true,
        threatsDetected,
        totalDetections,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error en detección programada:", error);
      throw error;
    }
  });

/**
 * Función Callable para ejecutar detecciones manualmente (recomendada)
 */
export const runDetectionManual = functions.https.onCall(async (data, context) => {
  // En desarrollo, permitir sin autenticación. En producción, requerir autenticación
  // if (!context.auth) {
  //   throw new functions.https.HttpsError("unauthenticated", "Debes estar autenticado");
  // }

  try {
    console.log("🔍 Iniciando detección manual de amenazas...");

    const serverId = data?.serverId as string | undefined;
    const config = await detectionService.getDetectionConfig();

    let results;
    if (serverId) {
      // Detectar amenazas para un servidor específico
      results = await detectionService.detectThreats(serverId, config);
    } else {
      // Detectar amenazas para todos los servidores
      results = await detectionService.detectThreatsForAllServers(config);
    }

    const threatsDetected = results.filter((r) => r.threatDetected).length;

    return {
      success: true,
      threatsDetected,
      totalDetections: results.length,
      results: results.map((r) => ({
        type: r.type,
        threatDetected: r.threatDetected,
        severity: r.severity,
        title: r.title,
        confidence: r.confidence,
      })),
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("❌ Error en detección manual:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error al ejecutar detección",
      {message: error.message},
    );
  }
});

/**
 * Función HTTP alternativa para ejecutar detecciones manualmente
 */
export const runDetectionManualHTTP = functions.https.onRequest(async (req, res) => {
  // Configurar headers CORS para permitir peticiones desde el frontend
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Manejar preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // En desarrollo, permitir sin autenticación
  // const authHeader = req.headers.authorization;
  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   res.status(401).json({error: "No autorizado"});
  //   return;
  // }

  try {
    console.log("🔍 Iniciando detección manual de amenazas (HTTP)...");

    const serverId = req.query.serverId as string | undefined;
    const config = await detectionService.getDetectionConfig();

    console.log("📊 Configuración de detección:", JSON.stringify(config, null, 2));

    let results;
    if (serverId) {
      console.log(`🎯 Detección para servidor específico: ${serverId}`);
      results = await detectionService.detectThreats(serverId, config);
    } else {
      console.log("🌐 Detección para todos los servidores activos...");
      results = await detectionService.detectThreatsForAllServers(config);
    }

    console.log(`📈 Resultados obtenidos: ${results.length} detección(es)`);
    results.forEach((r, i) => {
      console.log(`   ${i + 1}. Tipo: ${r.type}, Threat Detected: ${r.threatDetected}, Title: ${r.title || 'N/A'}`);
    });

    const threatsDetected = results.filter((r) => r.threatDetected).length;
    console.log(`🚨 Amenazas detectadas: ${threatsDetected}`);

    res.json({
      success: true,
      threatsDetected,
      totalDetections: results.length,
      results: results.map((r) => ({
        type: r.type,
        threatDetected: r.threatDetected,
        severity: r.severity,
        title: r.title,
        confidence: r.confidence,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error en detección manual (HTTP):", error);
    res.status(500).json({
      error: "Error al ejecutar detección",
      message: error.message,
    });
  }
});

