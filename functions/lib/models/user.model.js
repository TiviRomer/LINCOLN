"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userConverter = void 0;
exports.userConverter = {
    toFirestore: (user) => {
        const data = Object.assign({}, user);
        // No incluir el ID en los datos del documento
        delete data.id;
        return data;
    },
    fromFirestore: (snapshot) => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            role: data.role,
            department: data.department,
            isActive: data.isActive,
            lastLogin: data.lastLogin,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
//# sourceMappingURL=user.model.js.map