"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const admin = require("firebase-admin");
const department_model_1 = require("../models/department.model");
class DepartmentService {
    static async createDepartment(departmentData) {
        const now = admin.firestore.FieldValue.serverTimestamp();
        const newDepartment = Object.assign(Object.assign({}, departmentData), { parentId: departmentData.parentId || null, isActive: true, createdAt: now, updatedAt: now });
        const departmentRef = await admin.firestore()
            .collection(this.collection)
            .withConverter(department_model_1.departmentConverter)
            .add(newDepartment);
        const departmentDoc = await departmentRef.withConverter(department_model_1.departmentConverter).get();
        const department = departmentDoc.data();
        if (!department) {
            throw new Error('Error al crear el departamento');
        }
        return department;
    }
    static async getDepartment(departmentId) {
        const departmentDoc = await admin.firestore()
            .collection(this.collection)
            .doc(departmentId)
            .withConverter(department_model_1.departmentConverter)
            .get();
        return departmentDoc.data() || null;
    }
    static async getDepartmentByName(name) {
        const snapshot = await admin.firestore()
            .collection(this.collection)
            .where('name', '==', name)
            .withConverter(department_model_1.departmentConverter)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        return snapshot.docs[0].data();
    }
    static async updateDepartment(departmentId, data) {
        const updateData = Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        await admin.firestore()
            .collection(this.collection)
            .doc(departmentId)
            .withConverter(department_model_1.departmentConverter)
            .set(updateData, { merge: true });
    }
    static async deactivateDepartment(departmentId) {
        // Verificar si hay departamentos hijos activos
        const hasActiveChildren = await this.hasActiveChildren(departmentId);
        if (hasActiveChildren) {
            throw new Error('No se puede desactivar el departamento porque tiene departamentos hijos activos');
        }
        // Verificar si hay usuarios en el departamento
        const hasUsers = await this.hasUsers(departmentId);
        if (hasUsers) {
            throw new Error('No se puede desactivar el departamento porque tiene usuarios asignados');
        }
        await this.updateDepartment(departmentId, {
            isActive: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async deleteDepartment(departmentId) {
        // Verificar si hay departamentos hijos
        const hasChildren = await this.hasChildren(departmentId);
        if (hasChildren) {
            throw new Error('No se puede eliminar el departamento porque tiene departamentos hijos');
        }
        // Verificar si hay usuarios en el departamento
        const hasUsers = await this.hasUsers(departmentId);
        if (hasUsers) {
            throw new Error('No se puede eliminar el departamento porque tiene usuarios asignados');
        }
        await admin.firestore()
            .collection(this.collection)
            .doc(departmentId)
            .delete();
    }
    static async listDepartments(filters = {}) {
        let query = admin.firestore()
            .collection(this.collection)
            .withConverter(department_model_1.departmentConverter);
        if (filters.isActive !== undefined) {
            query = query.where('isActive', '==', filters.isActive);
        }
        if (filters.parentId !== undefined) {
            query = query.where('parentId', '==', filters.parentId);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data());
    }
    static async getChildDepartments(departmentId) {
        return this.listDepartments({
            parentId: departmentId,
            isActive: true
        });
    }
    static async getParentDepartment(departmentId) {
        const department = await this.getDepartment(departmentId);
        if (!department || !department.parentId) {
            return null;
        }
        return this.getDepartment(department.parentId);
    }
    static async getDepartmentTree(departmentId) {
        const department = await this.getDepartment(departmentId);
        if (!department) {
            throw new Error('Departamento no encontrado');
        }
        const tree = [department];
        let current = department;
        while (current.parentId) {
            const parent = await this.getDepartment(current.parentId);
            if (!parent)
                break;
            tree.unshift(parent);
            current = parent;
        }
        return tree;
    }
    static async getAllDescendants(departmentId) {
        const descendants = [];
        const queue = [departmentId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            const children = await this.listDepartments({
                parentId: currentId,
                isActive: true
            });
            for (const child of children) {
                descendants.push(child);
                queue.push(child.id);
            }
        }
        return descendants;
    }
    static async hasChildren(departmentId) {
        const snapshot = await admin.firestore()
            .collection(this.collection)
            .where('parentId', '==', departmentId)
            .limit(1)
            .get();
        return !snapshot.empty;
    }
    static async hasActiveChildren(departmentId) {
        const snapshot = await admin.firestore()
            .collection(this.collection)
            .where('parentId', '==', departmentId)
            .where('isActive', '==', true)
            .limit(1)
            .get();
        return !snapshot.empty;
    }
    static async hasUsers(departmentId) {
        const snapshot = await admin.firestore()
            .collection('users')
            .where('departmentId', '==', departmentId)
            .limit(1)
            .get();
        return !snapshot.empty;
    }
    static async moveDepartment(departmentId, newParentId) {
        if (departmentId === newParentId) {
            throw new Error('Un departamento no puede ser padre de sí mismo');
        }
        if (newParentId) {
            // Verificar que el nuevo padre existe
            const parent = await this.getDepartment(newParentId);
            if (!parent) {
                throw new Error('El departamento padre especificado no existe');
            }
            // Verificar que no se cree una referencia circular
            const descendants = await this.getAllDescendants(departmentId);
            if (descendants.some(d => d.id === newParentId)) {
                throw new Error('No se puede mover un departamento dentro de uno de sus descendientes');
            }
        }
        await this.updateDepartment(departmentId, {
            parentId: newParentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
}
exports.DepartmentService = DepartmentService;
DepartmentService.collection = 'departments';
//# sourceMappingURL=department.service.js.map