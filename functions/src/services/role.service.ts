import * as admin from "firebase-admin";
import {Role, roleConverter, CreateRole, Permission} from "../models/role.model";

export class RoleService {
  private static readonly collection = "roles";

  static async createRole(roleData: Omit<CreateRole, "createdAt" | "updatedAt" | "isSystem">): Promise<Role> {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const newRole: CreateRole = {
      ...roleData,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    };

    const roleRef = await admin.firestore()
      .collection(this.collection)
      .withConverter(roleConverter)
      .add(newRole);

    const roleDoc = await roleRef.withConverter(roleConverter).get();
    const roleResult = roleDoc.data();
    if (!roleResult) {
      throw new Error("Error al crear el rol");
    }
    // El converter ya incluye el id
    return roleResult as Role;
  }

  static async getRole(roleId: string): Promise<Role | null> {
    const roleDoc = await admin.firestore()
      .collection(this.collection)
      .doc(roleId)
      .withConverter(roleConverter)
      .get();

    const roleResult = roleDoc.data();
    // El converter ya incluye el id
    return (roleResult as Role | undefined) || null;
  }

  static async getRoleByName(name: string): Promise<Role | null> {
    const snapshot = await admin.firestore()
      .collection(this.collection)
      .where("name", "==", name)
      .withConverter(roleConverter)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Role;
  }

  static async updateRole(
    roleId: string,
    data: Partial<Omit<Role, "id" | "createdAt" | "isSystem">>,
  ): Promise<void> {
    // Evitar que se modifiquen roles del sistema
    const role = await this.getRole(roleId);
    if (role?.isSystem) {
      throw new Error("No se pueden modificar roles del sistema");
    }

    await admin.firestore()
      .collection(this.collection)
      .doc(roleId)
      .withConverter(roleConverter)
      .set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
  }

  static async deleteRole(roleId: string): Promise<void> {
    // Verificar si el rol es un rol del sistema
    const role = await this.getRole(roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }
    if (role.isSystem) {
      throw new Error("No se pueden eliminar roles del sistema");
    }

    // Verificar si hay usuarios con este rol
    const usersWithRole = await admin.firestore()
      .collection("users")
      .where("role", "==", roleId)
      .limit(1)
      .get();

    if (!usersWithRole.empty) {
      throw new Error("No se puede eliminar el rol porque hay usuarios asignados a él");
    }

    await admin.firestore()
      .collection(this.collection)
      .doc(roleId)
      .delete();
  }

  static async listRoles(filters: {
    isSystem?: boolean;
    limit?: number;
  } = {}): Promise<Role[]> {
    let query: admin.firestore.Query = admin.firestore()
      .collection(this.collection)
      .withConverter(roleConverter);

    if (filters.isSystem !== undefined) {
      query = query.where("isSystem", "==", filters.isSystem);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as Role);
  }

  static async addPermission(roleId: string, permission: Permission): Promise<void> {
    const role = await this.getRole(roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    const existingPermissionIndex = role.permissions.findIndex(
      (p) => p.resource === permission.resource,
    );

    const updatedPermissions = [...role.permissions];

    if (existingPermissionIndex >= 0) {
      // Actualizar permisos existentes para el recurso
      const existingActions = new Set(updatedPermissions[existingPermissionIndex].actions);
      permission.actions.forEach((action) => existingActions.add(action));
      updatedPermissions[existingPermissionIndex] = {
        resource: permission.resource,
        actions: Array.from(existingActions),
      };
    } else {
      // Agregar nuevo permiso
      updatedPermissions.push(permission);
    }

    await this.updateRole(roleId, {
      permissions: updatedPermissions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  static async removePermission(roleId: string, resource: string, action?: string): Promise<void> {
    const role = await this.getRole(roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    let updatedPermissions: Permission[];

    if (!action) {
      // Eliminar todos los permisos para el recurso
      updatedPermissions = role.permissions.filter(
        (p) => p.resource !== resource,
      );
    } else {
      // Eliminar acción específica del recurso
      updatedPermissions = role.permissions
        .map((p) => {
          if (p.resource === resource) {
            return {
              resource,
              actions: p.actions.filter((a) => a !== action),
            };
          }
          return p;
        })
        .filter((p) => p.actions.length > 0); // Eliminar recursos sin acciones
    }

    await this.updateRole(roleId, {permissions: updatedPermissions});
  }

  static async hasPermission(roleId: string, resource: string, action: string): Promise<boolean> {
    const role = await this.getRole(roleId);
    if (!role) return false;

    const permission = role.permissions.find((p) => p.resource === resource);
    if (!permission) return false;

    return permission.actions.includes(action);
  }

  static async getSystemRoles(): Promise<Role[]> {
    return this.listRoles({isSystem: true});
  }

  static async getCustomRoles(): Promise<Role[]> {
    return this.listRoles({isSystem: false});
  }
}
