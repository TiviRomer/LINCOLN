/**
 * Script de depuración para ver exactamente qué está pasando en la detección
 */

import http from 'http';

async function testDetection() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5001/lincoln-587b0/us-central1/runDetectionManualHTTP', (res) => {
      let data = '';
      
      console.log(`📡 Status Code: ${res.statusCode}`);
      console.log(`📡 Headers:`, res.headers);
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('\n📊 RESULTADO COMPLETO:');
          console.log(JSON.stringify(result, null, 2));
          resolve(result);
        } catch (e) {
          console.log('\n📄 RESPUESTA RAW:');
          console.log(data);
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      if (error.message.includes('ECONNREFUSED')) {
        console.error('   ⚠️  No se puede conectar a las funciones');
        console.error('   Asegúrate de que los emuladores estén ejecutándose');
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
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

