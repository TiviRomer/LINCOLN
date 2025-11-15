// functions/src/init-database.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as Joi from 'joi';

// NO inicializar aquí - ya se inicializa en index.ts

// Logger personalizado
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({ level: 'INFO', message, ...(data && { data }) }));
  },
  error: (message: string, error: any) => {
    console.error(JSON.stringify({ 
      level: 'ERROR', 
      message, 
      error: error.message, 
      stack: error.stack 
    }));
  }
};

// Esquema de validación para la inicialización
const initSchema = Joi.object({
  adminEmail: Joi.string().email().required(),
  adminPassword: Joi.string().min(8).required()
});

/**
 * Inicializa la base de datos con roles y departamentos por defecto
 * Requiere autenticación de administrador
 */
export const initializeDatabase = functions.https.onRequest(
  async (req: functions.https.Request, res: functions.Response) => {
  try {
    // Solo permitir método POST
    if (req.method !== 'POST') {
      res.set('Allow', 'POST');
      res.status(405).json({
        success: false,
        message: 'Método no permitido',
        error: 'Method not allowed'
      });
      return;
    }

    const { error } = initSchema.validate(req.body);
    
    if (error) {
      const validationErrors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      res.status(400).json({
        success: false,
        message: 'Datos de inicialización inválidos',
        errors: validationErrors
      });
      return;
    }

    const db = admin.firestore();
    
    // Verificar si ya está inicializado
    const settings = { timestampsInSnapshots: true };
    db.settings(settings);

    const configDoc = await db.collection('config').doc('system').get();
    if (configDoc.exists && configDoc.data()?.initialized) {
      res.status(400).json({
        success: false,
        error: 'La base de datos ya ha sido inicializada'
      });
      return;
    }

    // Resto del código de inicialización...
    // Asegúrate de que todas las respuestas usen res.json() y terminen con return;

  } catch (error) {
    logger.error('Error al inicializar la base de datos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    // No es necesario un return aquí ya que el tipo de retorno es void
  }
});

/**
 * Crea un usuario administrador (función de respaldo)
 */
export const createAdminUser = functions.https.onCall(async (data, context) => {
  // Solo administradores pueden crear otros administradores
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes estar autenticado para realizar esta acción'
    );
  }

  const { email, password, displayName } = data;

  try {
    // 1. Crear el usuario en Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true
    });

    // 2. Crear el documento del usuario en Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: 'admin',
      department: 'Administración',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, userId: userRecord.uid };
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    throw new functions.https.HttpsError('internal', 'No se pudo crear el usuario administrador');
  }
});