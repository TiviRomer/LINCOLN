"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const admin = require("firebase-admin");
const role_model_1 = require("../models/role.model");
class RoleService {
    static async createRole(roleData) {
        const now = admin.firestore.FieldValue.serverTimestamp();
        const newRole = Object.assign(Object.assign({}, roleData), { isSystem: false, createdAt: now, updatedAt: now });
        const roleRef = await admin.firestore()
            .collection(this.collection)
            .withConverter(role_model_1.roleConverter)
            .add(newRole);
        const roleDoc = await roleRef.withConverter(role_model_1.roleConverter).get();
        const role = roleDoc.data();
        if (!role) {
            throw new Error('Error al crear el rol');
        }
        return role;
    }
    static async getRole(roleId) {
        const roleDoc = await admin.firestore()
            .collection(this.collection)
            .doc(roleId)
            .withConverter(role_model_1.roleConverter)
            .get();
        return roleDoc.data() || null;
    }
    static async getRoleByName(name) {
        const snapshot = await admin.firestore()
            .collection(this.collection)
            .where('name', '==', name)
            .withConverter(role_model_1.roleConverter)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        return snapshot.docs[0].data();
    }
    static async updateRole(roleId, data) {
        // Evitar que se modifiquen roles del sistema
        const role = await this.getRole(roleId);
        if (role === null || role === void 0 ? void 0 : role.isSystem) {
            throw new Error('No se pueden modificar roles del sistema');
        }
        await admin.firestore()
            .collection(this.collection)
            .doc(roleId)
            .withConverter(role_model_1.roleConverter)
            .set(Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    }
    static async deleteRole(roleId) {
        // Verificar si el rol es un rol del sistema
        const role = await this.getRole(roleId);
        if (!role) {
            throw new Error('Rol no encontrado');
        }
        if (role.isSystem) {
            throw new Error('No se pueden eliminar roles del sistema');
        }
        // Verificar si hay usuarios con este rol
        const usersWithRole = await admin.firestore()
            .collection('users')
            .where('role', '==', roleId)
            .limit(1)
            .get();
        if (!usersWithRole.empty) {
            throw new Error('No se puede eliminar el rol porque hay usuarios asignados a él');
        }
        await admin.firestore()
            .collection(this.collection)
            .doc(roleId)
            .delete();
    }
    static async listRoles(filters = {}) {
        let query = admin.firestore()
            .collection(this.collection)
            .withConverter(role_model_1.roleConverter);
        if (filters.isSystem !== undefined) {
            query = query.where('isSystem', '==', filters.isSystem);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data());
    }
    static async addPermission(roleId, permission) {
        const role = await this.getRole(roleId);
        if (!role) {
            throw new Error('Rol no encontrado');
        }
        const existingPermissionIndex = role.permissions.findIndex(p => p.resource === permission.resource);
        const updatedPermissions = [...role.permissions];
        if (existingPermissionIndex >= 0) {
            // Actualizar permisos existentes para el recurso
            const existingActions = new Set(updatedPermissions[existingPermissionIndex].actions);
            permission.actions.forEach(action => existingActions.add(action));
            updatedPermissions[existingPermissionIndex] = {
                resource: permission.resource,
                actions: Array.from(existingActions)
            };
        }
        else {
            // Agregar nuevo permiso
            updatedPermissions.push(permission);
        }
        await this.updateRole(roleId, {
            permissions: updatedPermissions,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async removePermission(roleId, resource, action) {
        const role = await this.getRole(roleId);
        if (!role) {
            throw new Error('Rol no encontrado');
        }
        let updatedPermissions;
        if (!action) {
            // Eliminar todos los permisos para el recurso
            updatedPermissions = role.permissions.filter(p => p.resource !== resource);
        }
        else {
            // Eliminar acción específica del recurso
            updatedPermissions = role.permissions
                .map(p => {
                if (p.resource === resource) {
                    return {
                        resource,
                        actions: p.actions.filter(a => a !== action)
                    };
                }
                return p;
            })
                .filter(p => p.actions.length > 0); // Eliminar recursos sin acciones
        }
        await this.updateRole(roleId, { permissions: updatedPermissions });
    }
    static async hasPermission(roleId, resource, action) {
        const role = await this.getRole(roleId);
        if (!role)
            return false;
        const permission = role.permissions.find(p => p.resource === resource);
        if (!permission)
            return false;
        return permission.actions.includes(action);
    }
    static async getSystemRoles() {
        return this.listRoles({ isSystem: true });
    }
    static async getCustomRoles() {
        return this.listRoles({ isSystem: false });
    }
}
exports.RoleService = RoleService;
RoleService.collection = 'roles';
//# sourceMappingURL=role.service.js.map