import * as admin from "firebase-admin";
import {Alert, AlertStatus, AlertSeverity, AlertType, alertConverter, CreateAlert} from "../models/alert.model";
import {UserService} from "./user.service";
import {ServerService} from "./server.service";

export class AlertService {
  private static readonly collection = "alerts";

  static async createAlert(alertData: Omit<CreateAlert, "createdAt" | "updatedAt" | "status" | "assignedTo">): Promise<Alert> {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const newAlert: CreateAlert = {
      ...alertData,
      status: "open",
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
    };

    const alertRef = await admin.firestore()
      .collection(this.collection)
      .withConverter(alertConverter)
      .add(newAlert);

    const alertDoc = await alertRef.withConverter(alertConverter).get();
    const alertResult = alertDoc.data();
    if (!alertResult) {
      throw new Error("Error al crear la alerta");
    }
    // El converter ya incluye el id
    return alertResult as Alert;
  }

  static async getAlert(alertId: string): Promise<Alert | null> {
    const alertDoc = await admin.firestore()
      .collection(this.collection)
      .doc(alertId)
      .withConverter(alertConverter)
      .get();

    const alertResult = alertDoc.data();
    // El converter ya incluye el id
    return (alertResult as Alert | undefined) || null;
  }

  static async updateAlert(
    alertId: string,
    data: Partial<Omit<Alert, "id" | "createdAt">>,
  ): Promise<void> {
    await admin.firestore()
      .collection(this.collection)
      .doc(alertId)
      .withConverter(alertConverter)
      .set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
  }

  static async assignAlert(alertId: string, userId: string): Promise<void> {
    const user = await UserService.getUser(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await this.updateAlert(alertId, {
      assignedTo: userId,
      status: "acknowledged",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  static async acknowledgeAlert(alertId: string, _userId: string): Promise<void> {
    await this.updateAlert(alertId, {
      status: "in_progress",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Nota: acknowledgedBy y acknowledgedAt no están en el modelo actual
    // Se pueden agregar al modelo si se necesitan
  }

  static async closeAlert(alertId: string, resolution: string): Promise<void> {
    await this.updateAlert(alertId, {
      status: "closed",
      resolution,
      closedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  static async addComment(alertId: string, userId: string, comment: string): Promise<void> {
    const commentData = {
      userId,
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore()
      .collection(this.collection)
      .doc(alertId)
      .update({
        comments: admin.firestore.FieldValue.arrayUnion(commentData),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  static async getAlertWithServer(alertId: string): Promise<{ alert: Alert; server: any } | null> {
    const alert = await this.getAlert(alertId);
    if (!alert) return null;

    const server = await ServerService.getServer(alert.serverId);
    if (!server) return null;

    return {alert, server};
  }

  static async listAlerts(filters: {
    serverId?: string;
    status?: AlertStatus;
    severity?: AlertSeverity;
    type?: AlertType;
    assignedTo?: string | null;
    createdBy?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<Alert[]> {
    let query: admin.firestore.Query = admin.firestore()
      .collection(this.collection)
      .withConverter(alertConverter);

    if (filters.serverId) {
      query = query.where("serverId", "==", filters.serverId);
    }
    if (filters.status) {
      query = query.where("status", "==", filters.status);
    }
    if (filters.severity) {
      query = query.where("severity", "==", filters.severity);
    }
    if (filters.type) {
      query = query.where("type", "==", filters.type);
    }
    if (filters.assignedTo !== undefined) {
      query = query.where("assignedTo", "==", filters.assignedTo);
    }
    if (filters.createdBy) {
      query = query.where("createdBy", "==", filters.createdBy);
    }
    if (filters.startDate) {
      query = query.where("createdAt", ">=", admin.firestore.Timestamp.fromDate(filters.startDate));
    }
    if (filters.endDate) {
      query = query.where("createdAt", "<=", admin.firestore.Timestamp.fromDate(filters.endDate));
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.orderBy("createdAt", "desc");

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as Alert);
  }

  static async getAlertsForServer(serverId: string, limit: number = 50): Promise<Alert[]> {
    return this.listAlerts({
      serverId,
      limit,
      status: "open",
    });
  }

  static async getAlertStats(timeRange: "24h" | "7d" | "30d" | "all" = "7d") {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
    case "24h":
      startDate.setDate(now.getDate() - 1);
      break;
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "all":
      startDate = new Date(0); // Época Unix
      break;
    }

    const alerts = await this.listAlerts({
      startDate,
      endDate: now,
    });

    const stats = {
      total: alerts.length,
      byStatus: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byServer: {} as Record<string, number>,
      createdAt: admin.firestore.Timestamp.now(),
    };

    // Contar por estado, severidad, tipo y servidor
    alerts.forEach((alert) => {
      stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1;
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      stats.byServer[alert.serverId] = (stats.byServer[alert.serverId] || 0) + 1;
    });

    return stats;
  }

  static async getAlertTrends(days: number = 30) {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const alerts = await this.listAlerts({
      startDate,
      endDate: now,
    });

    // Agrupar por día
    const dailyTrends: Record<string, { date: string; count: number }> = {};

    alerts.forEach((alert) => {
      if (!alert.createdAt) return;

      const date = (alert.createdAt as admin.firestore.Timestamp).toDate();
      const dateStr = date.toISOString().split("T")[0]; // Formato YYYY-MM-DD

      if (!dailyTrends[dateStr]) {
        dailyTrends[dateStr] = {date: dateStr, count: 0};
      }
      dailyTrends[dateStr].count++;
    });

    // Convertir a array y ordenar por fecha
    return Object.values(dailyTrends).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  static async getAlertSummary(serverId?: string) {
    const now = new Date();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(now.getDate() - 1);

    const [total, last24h, byStatus, bySeverity] = await Promise.all([
      serverId ?
        this.listAlerts({serverId}) :
        this.listAlerts(),
      this.listAlerts({
        startDate: oneDayAgo,
        endDate: now,
        ...(serverId && {serverId}),
      }),
      serverId ?
        this.listAlerts({serverId}) :
        this.listAlerts(),
      serverId ?
        this.listAlerts({serverId}) :
        this.listAlerts(),
    ]);

    return {
      total: total.length,
      last24h: last24h.length,
      byStatus: this.countBy(byStatus, "status"),
      bySeverity: this.countBy(bySeverity, "severity"),
      updatedAt: admin.firestore.Timestamp.now(),
    };
  }

  private static countBy<T>(items: T[], key: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  static async escalateAlert(
    alertId: string,
    newSeverity: AlertSeverity,
    _reason: string,
  ): Promise<void> {
    const alert = await this.getAlert(alertId);
    if (!alert) {
      throw new Error("Alerta no encontrada");
    }

    await this.updateAlert(alertId, {
      severity: newSeverity,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Nota: escalation no está en el modelo actual
    // Se puede agregar al modelo si se necesita
  }

  static async getAlertsByUser(userId: string, filters: {
    status?: AlertStatus;
    limit?: number;
  } = {}): Promise<Alert[]> {
    return this.listAlerts({
      assignedTo: userId,
      ...filters,
    });
  }

  static async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
    return this.listAlerts({
      limit,
      status: "open",
    });
  }
}
