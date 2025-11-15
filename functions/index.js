// Importa las funciones desde src/index.ts compiladas
const {
  onUserCreated,
  createAlert,
  initializeDatabase,
  createAdminUser,
  runDetectionScheduled,
  runDetectionManual,
  runDetectionManualHTTP
} = require("./lib/index");

// Re-exporta las funciones para que Firebase las pueda encontrar
module.exports = {
  onUserCreated,
  createAlert,
  initializeDatabase,
  createAdminUser,
  runDetectionScheduled,
  runDetectionManual,
  runDetectionManualHTTP
};
