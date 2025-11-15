const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando entorno de desarrollo de LINCOLN...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Array para almacenar todos los procesos
const processes = [];
let isShuttingDown = false;

// Función para ejecutar comandos en background
const runInBackground = (command, args, cwd, label, color) => {
  const prefix = `[${label}]`;
  
  console.log(`${prefix} Iniciando...`);
  
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe',
    // En Windows, crear un nuevo grupo de procesos
    detached: false
  });

  // Guardar referencia del proceso
  processes.push({ process: child, label });

  child.stdout.on('data', (data) => {
    if (!isShuttingDown) {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${prefix} ${line}`);
      });
    }
  });

  child.stderr.on('data', (data) => {
    if (!isShuttingDown) {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${prefix} ${line}`);
      });
    }
  });

  child.on('close', (code) => {
    if (!isShuttingDown && code !== 0) {
      console.log(`${prefix} ⚠️  Proceso terminado con código ${code}`);
    }
  });

  return child;
};

// Función para cerrar todos los procesos correctamente
const shutdownAll = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('\n\n🛑 Deteniendo todos los servicios...');
  console.log('💾 Exportando datos a ./emulator-data (esto puede tardar unos segundos)...\n');

  // Cerrar cada proceso en orden inverso
  for (let i = processes.length - 1; i >= 0; i--) {
    const { process: proc, label } = processes[i];
    
    if (proc && !proc.killed) {
      console.log(`  ⏹️  Cerrando ${label}...`);
      
      try {
        // En Windows, intentar cerrar gracefully primero
        if (process.platform === 'win32') {
          // Enviar Ctrl+C al proceso
          proc.kill('SIGINT');
        } else {
          // En Unix, enviar SIGTERM
          proc.kill('SIGTERM');
        }
        
        // Esperar un momento para que cierre gracefully
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Si todavía no se cerró, forzar cierre
        if (!proc.killed) {
          console.log(`  💥 Forzando cierre de ${label}...`);
          proc.kill('SIGKILL');
        }
        
        console.log(`  ✅ ${label} cerrado`);
      } catch (error) {
        console.log(`  ⚠️  Error al cerrar ${label}:`, error.message);
      }
    }
  }

  console.log('\n✅ Todos los servicios detenidos correctamente');
  console.log('💾 Datos exportados a ./emulator-data');
  console.log('   (Se cargarán automáticamente en el próximo inicio)');
  console.log('\n👋 ¡Hasta pronto!\n');
  
  // Esperar un poco más para asegurar que todo se cerró
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

// Directorio raíz del proyecto
const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');

console.log('📍 Directorio raíz:', rootDir);
console.log('📂 Directorio frontend:', frontendDir);
console.log();

// Iniciar emuladores de Firebase
console.log('🔥 Paso 1: Iniciando emuladores de Firebase...');
const emulatorsProcess = runInBackground(
  'firebase',
  ['emulators:start', '--import=./emulator-data', '--export-on-exit'],
  rootDir,
  '🔥 Firebase',
  '\x1b[33m'
);

// Esperar 5 segundos antes de iniciar el frontend
setTimeout(() => {
  console.log('\n🌐 Paso 2: Iniciando aplicación frontend...\n');
  const frontendProcess = runInBackground(
    'npm',
    ['run', 'dev'],
    frontendDir,
    '⚛️  React',
    '\x1b[36m'
  );
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Entorno de desarrollo iniciado\n');
  console.log('📱 Frontend: http://localhost:3000');
  console.log('🔥 Firebase UI: http://localhost:4000');
  console.log('🔐 Auth Emulator: http://localhost:9099');
  console.log('📊 Firestore Emulator: http://localhost:8082');
  console.log('⚡ Functions Emulator: http://localhost:5001');
  console.log('\n💾 PERSISTENCIA DE DATOS ACTIVADA');
  console.log('   Los datos se guardarán automáticamente al cerrar');
  console.log('   Carpeta: ./emulator-data');
  console.log('\n⚠️  IMPORTANTE: Para guardar los datos al cerrar:');
  console.log('   1. Presiona Ctrl+C UNA SOLA VEZ');
  console.log('   2. ESPERA a que termine la exportación');
  console.log('   3. No cierres la ventana bruscamente');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}, 5000);

// Manejar Ctrl+C (SIGINT)
process.on('SIGINT', shutdownAll);

// Manejar cierre de terminal (SIGTERM)
process.on('SIGTERM', shutdownAll);

// Manejar cierre de ventana en Windows
if (process.platform === 'win32') {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', shutdownAll);
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('\n❌ Error no capturado:', error);
  shutdownAll();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Promesa rechazada no manejada:', reason);
  shutdownAll();
});
