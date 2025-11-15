"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminUser = exports.initializeDatabase = void 0;
// functions/src/init-database.ts
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const Joi = require("joi");
// Inicializa la aplicación de Firebase
admin.initializeApp();
// Logger personalizado
const logger = {
    info: (message, data) => {
        console.log(JSON.stringify(Object.assign({ level: 'INFO', message }, (data && { data }))));
    },
    error: (message, error) => {
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
exports.initializeDatabase = functions.https.onRequest(async (req, res) => {
    // Solo permitir método POST
    if (req.method !== 'POST') {
        res.set('Allow', 'POST');
        res.status(405).send('Método no permitido');
        return;
    }
    try {
        // Validar datos de entrada
        const { error, value } = initSchema.validate(req.body);
        if (error) {
            const validationErrors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({
                success: false,
                message: 'Datos de inicialización inválidos',
                errors: validationErrors
            });
        }
        const { adminEmail, adminPassword } = value;
        const db = admin.firestore();
        // 1. Verificar si ya existe un administrador
        const adminUser = await admin.auth().getUserByEmail(adminEmail).catch(() => null);
        if (adminUser) {
            logger.info('El usuario administrador ya existe', { email: adminEmail });
            return res.status(400).json({
                success: false,
                message: 'El usuario administrador ya existe'
            });
        }
        // 2. Crear roles por defecto
        const rolesRef = db.collection('roles');
        const defaultRoles = [
            {
                id: 'admin',
                name: 'Administrador',
                permissions: ['read:all', 'write:all', 'manage:users', 'manage:servers'],
                isSystem: true
            },
            {
                id: 'operator',
                name: 'Operador',
                permissions: ['read:all', 'write:alerts', 'manage:incidents'],
                isSystem: true
            },
            {
                id: 'auditor',
                name: 'Auditor',
                permissions: ['read:all'],
                isSystem: true
            },
            {
                id: 'user',
                name: 'Usuario',
                permissions: ['read:own', 'update:own'],
                isSystem: true
            }
        ];
        const batch = db.batch();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        // Agregar roles al lote
        for (const role of defaultRoles) {
            const roleRef = rolesRef.doc(role.id);
            batch.set(roleRef, {
                name: role.name,
                permissions: role.permissions,
                isSystem: role.isSystem,
                createdAt: timestamp,
                updatedAt: timestamp
            }, { merge: true });
        }
        // 3. Crear departamentos por defecto
        const deptRef = db.collection('departments');
        const defaultDepts = [
            { id: 'ti', name: 'TI' },
            { id: 'seguridad', name: 'Seguridad' },
            { id: 'administracion', name: 'Administración' },
            { id: 'operaciones', name: 'Operaciones' }
        ];
        // Agregar departamentos al lote
        for (const dept of defaultDepts) {
            const deptDoc = deptRef.doc(dept.id);
            batch.set(deptDoc, {
                name: dept.name,
                isSystem: true,
                createdAt: timestamp,
                updatedAt: timestamp
            }, { merge: true });
        }
        // Ejecutar el lote
        await batch.commit();
        // 4. Crear usuario administrador
        const userRecord = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword,
            emailVerified: true,
            displayName: 'Administrador del Sistema'
        });
        // Establecer rol de administrador
        await db.collection('users').doc(userRecord.uid).set({
            email: adminEmail,
            displayName: 'Administrador del Sistema',
            role: 'admin',
            isActive: true,
            department: 'ti',
            emailVerified: true,
            lastLogin: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp
        }, { merge: true });
        logger.info('Base de datos inicializada correctamente', { adminEmail });
        res.status(200).json({
            success: true,
            message: 'Base de datos inicializada correctamente',
            adminUserId: userRecord.uid
        });
    }
    catch (error) {
        logger.error('Error al inicializar la base de datos', error);
        res.status(500).json({
            success: false,
            message: 'Error al inicializar la base de datos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
/**
 * Crea un usuario administrador (función de respaldo)
 */
exports.createAdminUser = functions.https.onCall(async (data, context) => {
    // Solo administradores pueden crear otros administradores
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado para realizar esta acción');
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
    }
    catch (error) {
        console.error('Error al crear usuario administrador:', error);
        throw new functions.https.HttpsError('internal', 'No se pudo crear el usuario administrador');
    }
});
//# sourceMappingURL=init-database.js.map