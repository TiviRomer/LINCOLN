"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertConverter = void 0;
exports.alertConverter = {
    toFirestore: (alert) => {
        const data = Object.assign({}, alert);
        // No incluir el ID en los datos del documento
        delete data.id;
        return data;
    },
    fromFirestore: (snapshot) => {
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
//# sourceMappingURL=alert.model.js.map