import * as admin from "firebase-admin";

export interface Department {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

export type CreateDepartment = Omit<Department, "id" | "createdAt" | "updatedAt"> & {
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
};

export const departmentConverter = {
  toFirestore: (department: Partial<Department>) => {
    const data: any = {...department};
    delete data.id;
    return data;
  },
  fromFirestore: (snapshot: admin.firestore.QueryDocumentSnapshot): Department => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
