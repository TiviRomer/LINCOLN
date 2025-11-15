import * as admin from 'firebase-admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  department: string;
  isActive: boolean;
  lastLogin?: admin.firestore.Timestamp | admin.firestore.FieldValue;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

// Tipo para la creación de usuarios (sin campos opcionales)
export type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
};

export const userConverter = {
  toFirestore: (user: Partial<User>) => {
    const data: any = { ...user };
    // No incluir el ID en los datos del documento
    delete data.id;
    return data;
  },
  fromFirestore: (
    snapshot: admin.firestore.QueryDocumentSnapshot
  ): User => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: data.role,
      department: data.department,
      isActive: data.isActive,
      lastLogin: data.lastLogin,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};
