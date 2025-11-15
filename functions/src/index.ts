// functions/src/index.ts
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as Joi from "joi";

admin.initializeApp();

// Esquema de validación para alertas
const alertSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  serverId: Joi.string().required(),
  severity: Joi.string().valid("low", "medium", "high", "critical").required(),
  type: Joi.string().valid("intrusion", "malware", "policy_violation", "vulnerability", "other").required(),
  evidence: Joi.string().optional(),
});

// Logger personalizado
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({level: "INFO", message, ...(data && {data})}));
  },
  error: (message: string, error: any) => {
    console.error(JSON.stringify({
      level: "ERROR",
      message,
      error: error.message,
      stack: error.stack,
    }));
  },
};

// Exporta las funciones de inicialización
export {initializeDatabase, createAdminUser} from "./init-database";

// Exporta las funciones de detección
export {runDetectionScheduled, runDetectionManual, runDetectionManualHTTP} from "./services/detection/detection.scheduler";

/**
 * Crea un perfil de usuario cuando se registra un nuevo usuario
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const {uid, email, displayName, photoURL, emailVerified} = user;

  try {
    if (!email) {
      throw new Error("El correo electrónico es requerido");
    }

    const userData = {
      email,
      displayName: displayName || email.split("@")[0],
      photoURL: photoURL || "",
      role: "user",
      isActive: emailVerified || false,
      department: "",
      emailVerified: emailVerified || false,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("users").doc(uid).set(userData, {merge: true});

    logger.info(`Perfil creado para el usuario: ${uid}`, {email});
    return null;
  } catch (error: any) {
    logger.error(`Error al crear el perfil del usuario ${uid}`, error);

    // Enviar notificación al equipo de soporte
    await admin.firestore().collection("system_errors").add({
      type: "user_creation_failed",
      userId: uid,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  }
});

/**
 * Crea una nueva alerta de seguridad
 */
export const createAlert = functions.https.onCall(async (data, context) => {
  // Validar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Debes estar autenticado para crear una alerta",
    );
  }

  const userId = context.auth.uid;

  try {
    // Validar datos de entrada
    const {error, value} = alertSchema.validate(data, {abortEarly: false});

    if (error) {
      const validationErrors = error.details.map((detail: any) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      throw new functions.https.HttpsError(
        "invalid-argument",
        "Datos de alerta inválidos",
        {errors: validationErrors},
      );
    }

    // Obtener información del servidor
    const serverDoc = await admin.firestore()
      .collection("servers")
      .doc(data.serverId)
      .get();

    if (!serverDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "El servidor especificado no existe",
      );
    }

    const serverData = serverDoc.data();

    // Crear la alerta
    const alertData = {
      ...value,
      serverName: serverData?.name || "Desconocido",
      status: "open" as const,
      assignedTo: null as string | null,
      createdBy: userId,
      department: serverData?.department || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const alertRef = await admin.firestore().collection("alerts").add(alertData);

    // Registrar la acción
    await admin.firestore().collection("audit_logs").add({
      action: "alert_created",
      userId,
      alertId: alertRef.id,
      serverId: data.serverId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        severity: data.severity,
        type: data.type,
      },
    });

    logger.info(`Alerta creada: ${alertRef.id}`, {
      serverId: data.serverId,
      severity: data.severity,
    });

    return {
      success: true,
      alertId: alertRef.id,
    };
  } catch (error: any) {
    logger.error("Error al crear alerta", {
      userId: context.auth?.uid || "unknown",
      error: error.message,
      data,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      "Ocurrió un error al crear la alerta",
      {debug: error.message},
    );
  }
});
