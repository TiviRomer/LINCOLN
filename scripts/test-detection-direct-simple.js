/**
 * Script simple para probar la detección directamente
 */

import http from 'http';

async function testDetection() {
  console.log('🔍 Probando detección manual HTTP...\n');
  
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5001/lincoln-587b0/us-central1/runDetectionManualHTTP', (res) => {
      let data = '';
      
      console.log(`📡 Status: ${res.statusCode}`);
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('\n📊 RESULTADO:');
          console.log(JSON.stringify(result, null, 2));
          
          if (result.success && result.threatsDetected > 0) {
            console.log(`\n✅ ¡ÉXITO! Se detectaron ${result.threatsDetected} amenaza(s)`);
            result.results.forEach((r, i) => {
              if (r.threatDetected) {
                console.log(`   ${i + 1}. ${r.type.toUpperCase()} - ${r.title} (${r.severity})`);
              }
            });
          } else if (result.success) {
            console.log(`\n⚠️  Detección ejecutada pero no se encontraron amenazas`);
            console.log(`   Total detecciones: ${result.totalDetections}`);
            console.log(`   💡 Esto puede significar:`);
            console.log(`      - Los servidores no se encontraron`);
            console.log(`      - Las métricas no se leyeron correctamente`);
            console.log(`      - Los umbrales no se cumplen`);
            console.log(`   💡 Revisa los logs en la ventana de los emuladores para más detalles`);
          } else {
            console.log(`\n❌ Error en la detección`);
            console.log(`   Error: ${result.error || 'Desconocido'}`);
          }
          
          resolve(result);
        } catch (e) {
          console.log('\n📄 RESPUESTA RAW:');
          console.log(data);
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`\n❌ Error de conexión:`, error.message);
      if (error.message.includes('ECONNREFUSED')) {
        console.error(`   ⚠️  No se puede conectar a las funciones`);
        console.error(`   Asegúrate de que los emuladores estén ejecutándose`);
        console.error(`   Ejecuta: .\start.ps1`);
      }
      reject(error);
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

testDetection()
  .then(() => {
    console.log('\n✅ Prueba completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

