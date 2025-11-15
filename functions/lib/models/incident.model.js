"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentConverter = void 0;
exports.incidentConverter = {
    toFirestore: (incident) => {
        const data = Object.assign({}, incident);
        // No incluir el ID en los datos del documento
        delete data.id;
        return data;
    },
    fromFirestore: (snapshot) => {
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
//# sourceMappingURL=incident.model.js.map