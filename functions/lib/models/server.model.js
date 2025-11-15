"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverConverter = void 0;
exports.serverConverter = {
    toFirestore: (server) => {
        const data = Object.assign({}, server);
        // No incluir el ID en los datos del documento
        delete data.id;
        return data;
    },
    fromFirestore: (snapshot) => {
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
//# sourceMappingURL=server.model.js.map