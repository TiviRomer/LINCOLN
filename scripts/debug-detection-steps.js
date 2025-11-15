/**
 * Script para depurar paso a paso el proceso de detección
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  connectFirestoreEmulator,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-lincoln',
  storageBucket: 'demo-lincoln.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

console.log('🔥 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔌 Conectando a emuladores...');
connectFirestoreEmulator(db, 'localhost', 8082);
console.log('✅ Conectado a emuladores\n');

async function debugDetection() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 DEPURACIÓN PASO A PASO DE DETECCIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Paso 1: Verificar todos los servidores
    console.log('📡 Paso 1: Verificando TODOS los servidores...');
    const allServersSnapshot = await getDocs(collection(db, 'servers'));
    const allServers = allServersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`   Total de servidores: ${allServers.length}`);
    allServers.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (${s.id})`);
      console.log(`      isActive: ${s.isActive}, status: ${s.status}`);
    });

    // Paso 2: Verificar servidores activos
    console.log('\n📡 Paso 2: Buscando servidores con isActive=true y status=online...');
    const activeServersSnapshot = await getDocs(
      query(
        collection(db, 'servers'),
        where('isActive', '==', true),
        where('status', '==', 'online')
      )
    );
    
    const activeServers = activeServersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`   Servidores activos encontrados: ${activeServers.length}`);
    
    if (activeServers.length === 0) {
      console.log('   ❌ PROBLEMA: No hay servidores activos');
      console.log('   Esto explica por qué no se detecta nada');
      return;
    }

    activeServers.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (${s.id})`);
    });

    // Paso 3: Verificar métricas para cada servidor activo
    for (const server of activeServers) {
      console.log(`\n📊 Paso 3: Verificando métricas para ${server.name} (${server.id})...`);
      
      const metricsRef = collection(db, 'servers', server.id, 'metrics');
      
      // Intentar query con filtro de tiempo (como hace el detector)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      try {
        const recentMetricsSnapshot = await getDocs(
          query(
            metricsRef,
            where('timestamp', '>=', { seconds: Math.floor(fiveMinutesAgo.getTime() / 1000) }),
            orderBy('timestamp', 'desc'),
            limit(10)
          )
        );
        
        console.log(`   Métricas recientes (últimos 5 min): ${recentMetricsSnapshot.size}`);
        
        if (recentMetricsSnapshot.size === 0) {
          // Intentar sin filtro de tiempo
          const latestSnapshot = await getDocs(
            query(metricsRef, orderBy('timestamp', 'desc'), limit(1))
          );
          
          console.log(`   Métrica más reciente (sin filtro): ${latestSnapshot.size}`);
          
          if (latestSnapshot.size > 0) {
            const latest = latestSnapshot.docs[0].data();
            const timestamp = latest.timestamp?.toDate?.() || latest.timestamp;
            const timeAgo = Math.round((Date.now() - new Date(timestamp).getTime()) / 1000 / 60);
            
            console.log(`   📈 Última métrica:`);
            console.log(`      ID: ${latestSnapshot.docs[0].id}`);
            console.log(`      Hace: ${timeAgo} minutos`);
            console.log(`      failedLoginAttempts: ${latest.failedLoginAttempts || 0}`);
            console.log(`      networkConnections: ${latest.networkConnections?.length || 0}`);
            console.log(`      networkOut: ${latest.networkOut ? (latest.networkOut / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}`);
            console.log(`      cpuUsage: ${latest.cpuUsage || 0}%`);
            console.log(`      memoryUsage: ${latest.memoryUsage || 0}%`);
            
            if (latest.failedLoginAttempts >= 5) {
              console.log(`      ✅ Debería detectar INTRUSIÓN (${latest.failedLoginAttempts} >= 5)`);
            }
            if (latest.networkConnections?.length > 0) {
              const suspicious = latest.networkConnections.filter(c => 
                [22, 23, 3389, 5900, 1433, 3306, 5432].includes(c.localPort) ||
                ['SYN_SENT', 'FIN_WAIT', 'CLOSE_WAIT'].includes(c.state)
              );
              if (suspicious.length > 0) {
                console.log(`      ✅ Debería detectar INTRUSIÓN (${suspicious.length} conexiones sospechosas)`);
              }
            }
          } else {
            console.log(`   ❌ No hay métricas para este servidor`);
          }
        } else {
          recentMetricsSnapshot.docs.forEach((doc, i) => {
            const metric = doc.data();
            console.log(`   ${i + 1}. Métrica ${doc.id}: failedLoginAttempts=${metric.failedLoginAttempts || 0}`);
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Error en query con filtro de tiempo: ${error.message}`);
        console.log(`   Probablemente falta índice en Firestore`);
        
        // Fallback: obtener la más reciente sin filtro
        const latestSnapshot = await getDocs(
          query(metricsRef, orderBy('timestamp', 'desc'), limit(1))
        );
        
        if (latestSnapshot.size > 0) {
          const latest = latestSnapshot.docs[0].data();
          console.log(`   ✅ Métrica más reciente (fallback): failedLoginAttempts=${latest.failedLoginAttempts || 0}`);
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CONCLUSIÓN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (activeServers.length === 0) {
      console.log('❌ PROBLEMA PRINCIPAL: No hay servidores activos');
      console.log('   La función listServers no encuentra servidores porque:');
      console.log('   - O no hay servidores con isActive=true y status=online');
      console.log('   - O hay un problema con la query de Firestore');
    } else {
      console.log(`✅ Se encontraron ${activeServers.length} servidor(es) activo(s)`);
      console.log('   Si no se detectan amenazas, el problema está en:');
      console.log('   - Los detectores no están leyendo las métricas correctamente');
      console.log('   - Los umbrales no se cumplen');
      console.log('   - Los detectores tienen un error en su lógica');
    }

    console.log('\n✅ Depuración completada\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDetection();

