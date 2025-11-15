"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentConverter = void 0;
exports.departmentConverter = {
    toFirestore: (department) => {
        const data = Object.assign({}, department);
        delete data.id;
        return data;
    },
    fromFirestore: (snapshot) => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            name: data.name,
            description: data.description,
            parentId: data.parentId || null,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }
};
//# sourceMappingURL=department.model.js.map