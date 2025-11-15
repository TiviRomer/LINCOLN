"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleConverter = void 0;
exports.roleConverter = {
    toFirestore: (role) => {
        const data = Object.assign({}, role);
        delete data.id;
        return data;
    },
    fromFirestore: (snapshot) => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            name: data.name,
            description: data.description,
            permissions: data.permissions || [],
            isSystem: data.isSystem || false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
//# sourceMappingURL=role.model.js.map