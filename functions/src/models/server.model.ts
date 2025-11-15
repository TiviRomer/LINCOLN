import * as admin from 'firebase-admin';

export interface Server {
  id: string;
  name: string;
  ipAddress: string;
  hostname: string;
  os: string;
  osVersion: string;
  environment: 'production' | 'staging' | 'development' | 'testing';
  department: string;
  isActive: boolean;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen?: admin.firestore.Timestamp | admin.firestore.FieldValue;
  description?: string;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

// Tipo para la creación de servidores
export type CreateServer = Omit<Server, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'status'> & {
  isActive: boolean;
  status: 'online' | 'offline' | 'maintenance';
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
};

export const serverConverter = {
  toFirestore: (server: Partial<Server>) => {
    const data: any = { ...server };
    // No incluir el ID en los datos del documento
    delete data.id;
    return data;
  },
  fromFirestore: (
    snapshot: admin.firestore.QueryDocumentSnapshot
  ): Server => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      ipAddress: data.ipAddress,
      hostname: data.hostname,
      os: data.os,
      osVersion: data.osVersion,
      environment: data.environment,
      department: data.department,
      isActive: data.isActive,
      status: data.status,
      lastSeen: data.lastSeen,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};
