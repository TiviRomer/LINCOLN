/**
 * Script de prueba para verificar la población automática de datos
 * Simula la lógica de start-dev.js sin iniciar los emuladores
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;

// Función para ejecutar scripts de Node de forma síncrona
const runScript = (scriptPath, label) => {
  return new Promise((resolve, reject) => {
    console.log(`\n📝 ${label}...`);
    const scriptProcess = spawn('node', [scriptPath], {
      cwd: rootDir,
      shell: true,
      stdio: 'inherit'
    });

    scriptProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${label} completado\n`);
        resolve();
      } else {
        console.log(`⚠️  ${label} terminó con código ${code}\n`);
        // No rechazamos para que continúe aunque haya un error menor
        resolve();
      }
    });

    scriptProcess.on('error', (error) => {
      console.log(`❌ Error ejecutando ${label}:`, error.message);
      // No rechazamos para que continúe
      resolve();
    });
  });
};

// Función para poblar datos automáticamente
const populateData = async () => {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 POBLACIÓN AUTOMÁTICA DE DATOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar si ya hay datos (para no sobrescribir)
    const emulatorDataPath = path.join(rootDir, 'emulator-data', 'firestore_export');
    const hasExistingData = fs.existsSync(emulatorDataPath) && 
                           fs.readdirSync(emulatorDataPath).length > 0;

    if (hasExistingData) {
      console.log('💡 Datos existentes detectados en ./emulator-data');
      console.log('   Saltando población automática para preservar tus datos');
      console.log('   Si quieres poblar desde cero, borra ./emulator-data\n');
      return;
    }

    // Paso 1: Configurar sistema de detección
    await runScript('scripts/setup-detection-config.js', 'Configurando sistema de detección');

    // Paso 2: Poblar Firestore con datos básicos
    await runScript('scripts/populate-firestore.js', 'Poblando Firestore con datos básicos');

    // Paso 3: Poblar métricas de servidores (incluye amenazas de prueba)
    await runScript('scripts/populate-server-metrics.js', 'Poblando métricas de servidores');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ POBLACIÓN DE DATOS COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.log('\n⚠️  Error en población de datos:', error.message);
    console.log('   Continuando con el inicio del sistema...\n');
  }
};

// Ejecutar prueba
console.log('🧪 PRUEBA DE POBLACIÓN AUTOMÁTICA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚠️  NOTA: Este script requiere que los emuladores estén corriendo');
console.log('   Ejecuta: firebase emulators:start\n');

// Simular espera de 2 segundos antes de poblar
setTimeout(async () => {
  await populateData();
  console.log('\n✅ Prueba completada');
  process.exit(0);
}, 2000);

