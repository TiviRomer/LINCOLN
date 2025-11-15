"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const admin = require("firebase-admin");
const user_model_1 = require("../models/user.model");
const role_service_1 = require("./role.service");
const department_service_1 = require("./department.service");
class UserService {
    static async createUser(userData) {
        // Validar que el rol existe
        const role = await role_service_1.RoleService.getRole(userData.role);
        if (!role) {
            throw new Error("El rol especificado no existe");
        }
        // Validar que el departamento existe
        const department = await department_service_1.DepartmentService.getDepartment(userData.department);
        if (!department) {
            throw new Error("El departamento especificado no existe");
        }
        // Verificar si el email ya está en uso
        const existingUser = await this.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error("El correo electrónico ya está en uso");
        }
        const now = admin.firestore.FieldValue.serverTimestamp();
        const newUser = Object.assign(Object.assign({}, userData), { email: userData.email.toLowerCase(), isActive: true, createdAt: now, updatedAt: now });
        const userRef = await admin.firestore()
            .collection(this.collection)
            .withConverter(user_model_1.userConverter)
            .add(newUser);
        const userDoc = await userRef.withConverter(user_model_1.userConverter).get();
        const userResult = userDoc.data();
        if (!userResult) {
            throw new Error("Error al crear el usuario");
        }
        // El converter ya incluye el id
        return userResult;
    }
    static async getUser(userId) {
        const userDoc = await admin.firestore()
            .collection(this.collection)
            .doc(userId)
            .withConverter(user_model_1.userConverter)
            .get();
        const userResult = userDoc.data();
        // El converter ya incluye el id
        return userResult || null;
    }
    static async updateUser(userId, data) {
        if (data.email) {
            // Verificar si el nuevo email ya está en uso
            const existingUser = await this.getUserByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
                throw new Error("El correo electrónico ya está en uso");
            }
            data.email = data.email.toLowerCase();
        }
        if (data.role) {
            // Validar que el rol existe
            const role = await role_service_1.RoleService.getRole(data.role);
            if (!role) {
                throw new Error("El rol especificado no existe");
            }
        }
        if (data.department) {
            // Validar que el departamento existe
            const department = await department_service_1.DepartmentService.getDepartment(data.department);
            if (!department) {
                throw new Error("El departamento especificado no existe");
            }
        }
        await admin.firestore()
            .collection(this.collection)
            .doc(userId)
            .withConverter(user_model_1.userConverter)
            .set(Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    }
    static async deactivateUser(userId) {
        // Verificar si el usuario tiene alertas asignadas
        const AlertService = (await Promise.resolve().then(() => require("./alert.service"))).AlertService;
        const userAlerts = await AlertService.listAlerts({
            assignedTo: userId,
            status: "open",
        });
        if (userAlerts.length > 0) {
            throw new Error("No se puede desactivar el usuario porque tiene alertas asignadas");
        }
        await this.updateUser(userId, {
            isActive: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    static async activateUser(userId) {
        await this.updateUser(userId, {
            isActive: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    static async updateLastLogin(userId) {
        await admin.firestore()
            .collection(this.collection)
            .doc(userId)
            .update({
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    static async getUserByEmail(email) {
        const snapshot = await admin.firestore()
            .collection(this.collection)
            .where("email", "==", email.toLowerCase())
            .withConverter(user_model_1.userConverter)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        const userResult = doc.data();
        return userResult || null;
    }
    static async listUsers(filters = {}) {
        let query = admin.firestore()
            .collection(this.collection)
            .withConverter(user_model_1.userConverter);
        if (filters.role) {
            query = query.where("role", "==", filters.role);
        }
        if (filters.department) {
            query = query.where("department", "==", filters.department);
        }
        if (filters.isActive !== undefined) {
            query = query.where("isActive", "==", filters.isActive);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        // Ordenar por nombre
        query = query.orderBy("displayName", "asc");
        const snapshot = await query.get();
        let users = snapshot.docs.map((doc) => doc.data());
        // Búsqueda por texto (si se proporciona)
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            users = users.filter((user) => user.displayName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm));
        }
        return users;
    }
    static async getUsersByDepartment(departmentId, options = {}) {
        return this.listUsers({
            department: departmentId,
            isActive: options.activeOnly,
            limit: options.limit,
        });
    }
    static async getUsersByRole(roleId, options = {}) {
        return this.listUsers({
            role: roleId,
            isActive: options.activeOnly,
            limit: options.limit,
        });
    }
    static async getUserWithDetails(userId) {
        const user = await this.getUser(userId);
        if (!user)
            return null;
        const [role, department] = await Promise.all([
            role_service_1.RoleService.getRole(user.role),
            department_service_1.DepartmentService.getDepartment(user.department),
        ]);
        if (!role || !department) {
            throw new Error("No se pudo cargar la información completa del usuario");
        }
        return { user, role, department };
    }
    static async updateUserRole(userId, newRoleId) {
        const role = await role_service_1.RoleService.getRole(newRoleId);
        if (!role) {
            throw new Error("El rol especificado no existe");
        }
        await this.updateUser(userId, {
            role: newRoleId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    static async updateUserDepartment(userId, newDepartmentId) {
        const department = await department_service_1.DepartmentService.getDepartment(newDepartmentId);
        if (!department) {
            throw new Error("El departamento especificado no existe");
        }
        await this.updateUser(userId, {
            department: newDepartmentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    static async searchUsers(searchTerm, options = {}) {
        return this.listUsers({
            searchTerm,
            isActive: options.activeOnly,
            limit: options.limit,
        });
    }
    static async getUsersCount(filters = {}) {
        let query = admin.firestore()
            .collection(this.collection);
        if (filters.role) {
            query = query.where("role", "==", filters.role);
        }
        if (filters.department) {
            query = query.where("department", "==", filters.department);
        }
        if (filters.isActive !== undefined) {
            query = query.where("isActive", "==", filters.isActive);
        }
        const snapshot = await query.count().get();
        return snapshot.data().count;
    }
    static async isEmailAvailable(email, excludeUserId) {
        const user = await this.getUserByEmail(email);
        return !user || (excludeUserId ? user.id !== excludeUserId : false);
    }
    static async bulkUpdateUsers(userIds, updates) {
        const batch = admin.firestore().batch();
        const usersRef = admin.firestore().collection(this.collection);
        const now = admin.firestore.FieldValue.serverTimestamp();
        // Validar roles si se están actualizando
        if (updates.role) {
            const role = await role_service_1.RoleService.getRole(updates.role);
            if (!role) {
                throw new Error("El rol especificado no existe");
            }
        }
        // Validar departamentos si se están actualizando
        if (updates.department) {
            const department = await department_service_1.DepartmentService.getDepartment(updates.department);
            if (!department) {
                throw new Error("El departamento especificado no existe");
            }
        }
        // Preparar actualizaciones por lotes
        for (const userId of userIds) {
            const userRef = usersRef.doc(userId);
            batch.update(userRef, Object.assign(Object.assign({}, updates), { updatedAt: now }));
        }
        // Ejecutar actualizaciones por lotes
        await batch.commit();
    }
}
exports.UserService = UserService;
UserService.collection = "users";
//# sourceMappingURL=user.service.js.map