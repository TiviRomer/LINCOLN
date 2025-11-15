// Dashboard Types and Interfaces

export type SecurityStatus = 'good' | 'warning' | 'critical';
export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ThreatType = 'ransomware' | 'intrusion' | 'data_leak' | 'anomalous_behavior';
export type ServerStatus = 'online' | 'offline' | 'warning';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated';
export type IncidentStatus = 'active' | 'investigating' | 'contained' | 'resolved';

export interface OverviewMetrics {
  securityStatus: SecurityStatus;
  activeThreats: number;
  totalServers: number;
  onlineServers: number;
  offlineServers: number;
  recentIncidents24h: number;
  recentIncidents7d: number;
  systemUptime: number; // percentage
  lastScan: Date;
}

export interface Threat {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  serverId: string;
  serverName: string;
  description: string;
  timestamp: Date;
  status: 'detected' | 'investigating' | 'resolved';
}

export interface Server {
  id: string;
  name: string;
  ip: string;
  status: ServerStatus;
  location: string;
  department?: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  lastActivity: Date;
  tags?: string[];
}

export interface Alert {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  serverId: string;
  serverName: string;
  title: string;
  description: string;
  timestamp: Date;
  status: AlertStatus;
}

export interface RansomwareDetection {
  id: string;
  serverId: string;
  serverName: string;
  suspiciousProcess: string;
  fileEncryptionAttempts: number;
  blockedAttempts: number;
  patternAnalysis: string;
  automatedActions: string[];
  timestamp: Date;
  status: 'active' | 'contained' | 'resolved';
}

export interface DataLeakAttempt {
  id: string;
  serverId: string;
  serverName: string;
  dataType: string;
  accessPattern: string;
  blocked: boolean;
  timestamp: Date;
  sensitiveDataAccessed: string[];
}

export interface Incident {
  id: string;
  title: string;
  type: ThreatType;
  severity: ThreatSeverity;
  status: IncidentStatus;
  affectedServers: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  automatedResponses: string[];
  manualActions: string[];
  timeline: IncidentTimelineEvent[];
}

export interface IncidentTimelineEvent {
  timestamp: Date;
  action: string;
  actor: string; // 'system' | user name
  description: string;
}

export interface SystemHealth {
  backendStatus: 'healthy' | 'degraded' | 'down';
  databaseStatus: 'connected' | 'disconnected';
  apiResponseTime: number; // ms
  connectedAgents: number;
  totalAgents: number;
  lastHeartbeat: Date;
  storageUsage: number; // percentage
  logRetentionDays: number;
}

export interface ComplianceStatus {
  level: 'compliant' | 'partial' | 'non_compliant';
  score: number; // 0-100
  lastAudit: Date;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  status: 'met' | 'partial' | 'not_met';
  lastChecked: Date;
}

export interface SecurityMetrics {
  threatTrends: {
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }[];
  threatTypeDistribution: {
    type: ThreatType;
    count: number;
  }[];
  serverHealthDistribution: {
    status: ServerStatus;
    count: number;
  }[];
  incidentResponseTime: {
    date: string;
    averageTime: number; // minutes
  }[];
}

