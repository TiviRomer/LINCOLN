/**
 * Wrapper para ejecutar detección directa cada 30 segundos
 * Esto evita problemas con funciones HTTP y ejecuta la lógica directamente
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const intervalSeconds = parseInt(process.argv[2]) || 30;
const detectionScript = join(__dirname, 'run-detection-direct-final.js');

async function runDetection() {
  const proc = spawn('node', [detectionScript], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  
  let output = '';
  
  proc.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  proc.stderr.on('data', (data) => {
    // Solo mostrar errores críticos
    const errorMsg = data.toString();
    if (errorMsg.includes('Error') || errorMsg.includes('ERROR')) {
      console.error(`   ❌ ${errorMsg.trim()}`);
    }
  });
  
  proc.on('close', (code) => {
    // Extraer solo las líneas importantes
    const lines = output.split('\n');
    const summaryLine = lines.find(l => l.includes('Total de amenazas detectadas:'));
    const threatLines = lines.filter(l => 
      l.includes('INTRUSION') || 
      l.includes('DATA_LEAK') || 
      l.includes('ANOMALOUS') || 
      l.includes('RANSOMWARE')
    );
    
    if (summaryLine) {
      const threatCount = summaryLine.match(/\d+/)?.[0] || '0';
      if (parseInt(threatCount) > 0) {
        console.log(`   ✅ ${threatCount} amenaza(s) detectada(s)`);
        threatLines.slice(0, 3).forEach((line) => {
          const match = line.match(/(\d+)\.\s+(\w+)\s+-\s+(.+)/);
          if (match) {
            console.log(`      ${match[1]}. ${match[2]} - ${match[3].substring(0, 50)}`);
          }
        });
      } else {
        console.log(`   ✅ Sin amenazas detectadas`);
      }
    }
    
    if (code !== 0 && code !== null) {
      console.error(`   ⚠️  Detección terminó con código: ${code}`);
    }
  });
}

// Ejecutar inmediatamente
runDetection();

// Ejecutar cada intervalo
setInterval(() => {
  console.log(`\n🔍 [${new Date().toLocaleTimeString()}] Ejecutando detección automática...`);
  runDetection();
}, intervalSeconds * 1000);

console.log(`🔄 Detección automática iniciada - ejecutándose cada ${intervalSeconds} segundos`);
console.log(`   Usando detección directa (sin funciones HTTP)\n`);

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo detección automática...');
  process.exit(0);
});

