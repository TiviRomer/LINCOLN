import * as admin from "firebase-admin";

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

export type CreateRole = Omit<Role, "id" | "createdAt" | "updatedAt"> & {
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
};

export const roleConverter = {
  toFirestore: (role: Partial<Role>) => {
    const data: any = {...role};
    delete data.id;
    return data;
  },
  fromFirestore: (snapshot: admin.firestore.QueryDocumentSnapshot): Role => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      permissions: data.permissions || [],
      isSystem: data.isSystem || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
