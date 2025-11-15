import * as admin from "firebase-admin";

export type IncidentStatus = "active" | "investigating" | "contained" | "resolved";
export type ThreatSeverity = "low" | "medium" | "high" | "critical";
export type ThreatType = "ransomware" | "intrusion" | "data_leak" | "anomalous_behavior";

export interface IncidentTimelineEvent {
  timestamp: admin.firestore.Timestamp | admin.firestore.FieldValue;
  action: string;
  actor: string; // 'system' | user name
  description: string;
}

export interface Incident {
  id: string;
  title: string;
  type: ThreatType;
  severity: ThreatSeverity;
  status: IncidentStatus;
  affectedServers: string[];
  detectedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  resolvedAt?: admin.firestore.Timestamp | admin.firestore.FieldValue;
  automatedResponses: string[];
  manualActions: string[];
  timeline: IncidentTimelineEvent[];
  assignedTo?: string | null;
  createdBy: string;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

// Tipo para la creación de incidentes
export type CreateIncident = Omit<Incident, "id" | "createdAt" | "updatedAt" | "status" | "resolvedAt" | "assignedTo"> & {
  status: IncidentStatus;
  resolvedAt?: admin.firestore.FieldValue;
  assignedTo?: string | null;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
};

export const incidentConverter = {
  toFirestore: (incident: Partial<Incident>) => {
    const data: any = {...incident};
    // No incluir el ID en los datos del documento
    delete data.id;
    return data;
  },
  fromFirestore: (snapshot: admin.firestore.QueryDocumentSnapshot): Incident => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title,
      type: data.type,
      severity: data.severity,
      status: data.status,
      affectedServers: data.affectedServers || [],
      detectedAt: data.detectedAt,
      resolvedAt: data.resolvedAt,
      automatedResponses: data.automatedResponses || [],
      manualActions: data.manualActions || [],
      timeline: data.timeline || [],
      assignedTo: data.assignedTo || null,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

