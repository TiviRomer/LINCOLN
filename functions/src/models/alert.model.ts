import * as admin from "firebase-admin";

export type AlertStatus = "open" | "acknowledged" | "in_progress" | "resolved" | "closed";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertType = "intrusion" | "malware" | "policy_violation" | "vulnerability" | "other";

export interface Alert {
  id: string;
  title: string;
  description: string;
  status: AlertStatus;
  severity: AlertSeverity;
  type: AlertType;
  serverId: string;
  serverName: string;
  source: string;
  evidence?: string;
  assignedTo: string | null;
  createdBy: string;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  closedAt?: admin.firestore.Timestamp | admin.firestore.FieldValue;
  resolution?: string;
}

// Tipo para la creación de alertas (sin campos opcionales)
export type CreateAlert = Omit<Alert, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "closedAt"> & {
  status: AlertStatus;
  assignedTo: string | null;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  closedAt?: admin.firestore.FieldValue;
};

export const alertConverter = {
  toFirestore: (alert: Partial<Alert>) => {
    const data: any = {...alert};
    // No incluir el ID en los datos del documento
    delete data.id;
    return data;
  },
  fromFirestore: (
    snapshot: admin.firestore.QueryDocumentSnapshot,
  ): Alert => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title,
      description: data.description,
      status: data.status,
      severity: data.severity,
      type: data.type,
      serverId: data.serverId,
      serverName: data.serverName,
      source: data.source,
      evidence: data.evidence,
      assignedTo: data.assignedTo || null,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      closedAt: data.closedAt,
      resolution: data.resolution,
    };
  },
};
