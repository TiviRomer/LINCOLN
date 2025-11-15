/**
 * Tipos y interfaces para el sistema de detección
 */

import {Server} from "../../models/server.model";
import {AlertSeverity} from "../../models/alert.model";

export type DetectionType = "ransomware" | "intrusion" | "data_leak" | "anomalous_behavior";

export interface DetectionResult {
  threatDetected: boolean;
  type: DetectionType;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence?: string;
  serverId: string;
  confidence: number; // 0-100
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DetectionConfig {
  enableRansomwareDetection?: boolean;
  enableIntrusionDetection?: boolean;
  enableDataLeakPrevention?: boolean;
  enableAnomalyDetection?: boolean;
  suspiciousProcesses?: string[];
  detectionInterval?: number; // en segundos
}

export interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number; // bytes
  networkOut: number; // bytes
  activeConnections: number;
  failedLoginAttempts: number;
  processes: ProcessInfo[];
  fileChanges: FileChangeInfo[];
  networkConnections: NetworkConnectionInfo[];
  timestamp: Date;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  command: string;
  user: string;
  startTime: Date;
}

export interface FileChangeInfo {
  path: string;
  action: "created" | "modified" | "deleted" | "renamed";
  size?: number;
  timestamp: Date;
  user: string;
}

export interface NetworkConnectionInfo {
  protocol: string;
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: string;
  processName?: string;
  timestamp: Date;
}

export interface BaseDetector {
  detect(serverId: string, server: Server): Promise<DetectionResult[]>;
}

