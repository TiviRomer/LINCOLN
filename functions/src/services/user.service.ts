import * as admin from 'firebase-admin';
import { User, userConverter, CreateUser } from '../models/user.model';
import { RoleService } from './role.service';
import { DepartmentService } from './department.service';

export class UserService {
  private static readonly collection = 'users';

  static async createUser(userData: Omit<CreateUser, 'createdAt' | 'updatedAt' | 'isActive'>): Promise<User> {
    // Validar que el rol existe
    const role = await RoleService.getRole(userData.role);
    if (!role) {
      throw new Error('El rol especificado no existe');
    }

    // Validar que el departamento existe
    const department = await DepartmentService.getDepartment(userData.department);
    if (!department) {
      throw new Error('El departamento especificado no existe');
    }

    // Verificar si el email ya está en uso
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está en uso');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const newUser: CreateUser = {
      ...userData,
      email: userData.email.toLowerCase(),
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    const userRef = await admin.firestore()
      .collection(this.collection)
      .withConverter(userConverter)
      .add(newUser);

    const userDoc = await userRef.withConverter(userConverter).get();
    const user = userDoc.data();
    if (!user) {
      throw new Error('Error al crear el usuario');
    }
    return user;
  }

  static async getUser(userId: string): Promise<User | null> {
    const userDoc = await admin.firestore()
      .collection(this.collection)
      .doc(userId)
      .withConverter(userConverter)
      .get();

    return userDoc.data() || null;
  }

  static async updateUser(
    userId: string, 
    data: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<void> {
    if (data.email) {
      // Verificar si el nuevo email ya está en uso
      const existingUser = await this.getUserByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('El correo electrónico ya está en uso');
      }
      data.email = data.email.toLowerCase();
    }

    if (data.role) {
      // Validar que el rol existe
      const role = await RoleService.getRole(data.role);
      if (!role) {
        throw new Error('El rol especificado no existe');
      }
    }

    if (data.department) {
      // Validar que el departamento existe
      const department = await DepartmentService.getDepartment(data.department);
      if (!department) {
        throw new Error('El departamento especificado no existe');
      }
    }

    await admin.firestore()
      .collection(this.collection)
      .doc(userId)
      .withConverter(userConverter)
      .set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
  }

  static async deactivateUser(userId: string): Promise<void> {
    // Verificar si el usuario tiene alertas asignadas
    const AlertService = (await import('./alert.service')).AlertService;
    const userAlerts = await AlertService.listAlerts({ 
      assignedTo: userId,
      status: 'open'
    });

    if (userAlerts.length > 0) {
      throw new Error('No se puede desactivar el usuario porque tiene alertas asignadas');
    }

    await this.updateUser(userId, { 
      isActive: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async activateUser(userId: string): Promise<void> {
    await this.updateUser(userId, { 
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async updateLastLogin(userId: string): Promise<void> {
    await admin.firestore()
      .collection(this.collection)
      .doc(userId)
      .update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const snapshot = await admin.firestore()
      .collection(this.collection)
      .where('email', '==', email.toLowerCase())
      .withConverter(userConverter)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return doc.data();
  }

  static async listUsers(filters: {
    role?: string;
    department?: string;
    isActive?: boolean;
    searchTerm?: string;
    limit?: number;
  } = {}): Promise<User[]> {
    let query: admin.firestore.Query = admin.firestore()
      .collection(this.collection)
      .withConverter(userConverter);

    if (filters.role) {
      query = query.where('role', '==', filters.role);
    }
    if (filters.department) {
      query = query.where('department', '==', filters.department);
    }
    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    // Ordenar por nombre
    query = query.orderBy('displayName', 'asc');

    const snapshot = await query.get();
    let users = snapshot.docs.map(doc => doc.data() as User);

    // Búsqueda por texto (si se proporciona)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      users = users.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    return users;
  }

  static async getUsersByDepartment(departmentId: string, options: {
    activeOnly?: boolean;
    limit?: number;
  } = {}): Promise<User[]> {
    return this.listUsers({
      department: departmentId,
      isActive: options.activeOnly,
      limit: options.limit
    });
  }

  static async getUsersByRole(roleId: string, options: {
    activeOnly?: boolean;
    limit?: number;
  } = {}): Promise<User[]> {
    return this.listUsers({
      role: roleId,
      isActive: options.activeOnly,
      limit: options.limit
    });
  }

  static async getUserWithDetails(userId: string): Promise<{
    user: User;
    role: any;
    department: any;
  } | null> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const [role, department] = await Promise.all([
      RoleService.getRole(user.role),
      DepartmentService.getDepartment(user.department)
    ]);

    if (!role || !department) {
      throw new Error('No se pudo cargar la información completa del usuario');
    }

    return { user, role, department };
  }

  static async updateUserRole(userId: string, newRoleId: string): Promise<void> {
    const role = await RoleService.getRole(newRoleId);
    if (!role) {
      throw new Error('El rol especificado no existe');
    }

    await this.updateUser(userId, { 
      role: newRoleId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async updateUserDepartment(userId: string, newDepartmentId: string): Promise<void> {
    const department = await DepartmentService.getDepartment(newDepartmentId);
    if (!department) {
      throw new Error('El departamento especificado no existe');
    }

    await this.updateUser(userId, { 
      department: newDepartmentId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async searchUsers(searchTerm: string, options: {
    limit?: number;
    activeOnly?: boolean;
  } = {}): Promise<User[]> {
    return this.listUsers({
      searchTerm,
      isActive: options.activeOnly,
      limit: options.limit
    });
  }

  static async getUsersCount(filters: {
    role?: string;
    department?: string;
    isActive?: boolean;
  } = {}): Promise<number> {
    let query: admin.firestore.Query = admin.firestore()
      .collection(this.collection);

    if (filters.role) {
      query = query.where('role', '==', filters.role);
    }
    if (filters.department) {
      query = query.where('department', '==', filters.department);
    }
    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }

    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  static async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return !user || (excludeUserId ? user.id !== excludeUserId : false);
  }

  static async bulkUpdateUsers(userIds: string[], updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const batch = admin.firestore().batch();
    const usersRef = admin.firestore().collection(this.collection);
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Validar roles si se están actualizando
    if (updates.role) {
      const role = await RoleService.getRole(updates.role);
      if (!role) {
        throw new Error('El rol especificado no existe');
      }
    }

    // Validar departamentos si se están actualizando
    if (updates.department) {
      const department = await DepartmentService.getDepartment(updates.department);
      if (!department) {
        throw new Error('El departamento especificado no existe');
      }
    }

    // Preparar actualizaciones por lotes
    for (const userId of userIds) {
      const userRef = usersRef.doc(userId);
      batch.update(userRef, {
        ...updates,
        updatedAt: now
      });
    }

    // Ejecutar actualizaciones por lotes
    await batch.commit();
  }
}
