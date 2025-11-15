// Importa las funciones desde src/index.ts
const {onUserCreated, helloWorld} = require("./lib/index");

// Re-exporta las funciones para que Firebase las pueda encontrar
module.exports = {
  onUserCreated,
  helloWorld,
};
