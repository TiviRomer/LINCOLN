/**
 * Helper para verificar y crear datos automáticamente si no existen
 * Utilizado por otros scripts para asegurar que los datos necesarios estén disponibles
 */

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

/**
 * Verifica y crea servidores si no existen
 */
export async function ensureServers(db) {
  console.log('🔍 Verificando servidores...');
  const serversSnapshot = await getDocs(collection(db, 'servers'));
  
  if (serversSnapshot.size > 0) {
    const onlineServers = serversSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((s) => s.isActive && s.status === 'online');
    
    if (onlineServers.length > 0) {
      console.log(`   ✅ Encontrados ${serversSnapshot.size} servidor(es), ${onlineServers.length} online`);
      return onlineServers;
    }
  }

  console.log('   ⚠️  No hay servidores. Creando servidores básicos...');
  
  const servers = [
    {
      name: 'Servidor Principal',
      ipAddress: '192.168.1.10',
      hostname: 'srv-main-01',
      os: 'Ubuntu Server',
      osVersion: '22.04 LTS',
      environment: 'production',
      department: 'IT',
      isActive: true,
      status: 'online',
      location: 'Centro de Datos A',
      cpuUsage: 45,
      memoryUsage: 60,
      diskUsage: 50,
      tags: ['production', 'critical', 'web-server'],
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      name: 'Servidor de Base de Datos',
      ipAddress: '192.168.1.11',
      hostname: 'srv-db-01',
      os: 'Ubuntu Server',
      osVersion: '22.04 LTS',
      environment: 'production',
      department: 'IT',
      isActive: true,
      status: 'online',
      location: 'Centro de Datos A',
      cpuUsage: 75,
      memoryUsage: 85,
      diskUsage: 50,
      tags: ['production', 'database', 'critical'],
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  const createdServers = [];
  for (const server of servers) {
    const docRef = await addDoc(collection(db, 'servers'), server);
    createdServers.push({ id: docRef.id, ...server });
    console.log(`   ✅ Creado: ${server.name} (${docRef.id})`);
  }

  console.log(`   ✅ ${createdServers.length} servidor(es) creado(s)`);
  return createdServers;
}

/**
 * Verifica y crea configuración de detección si no existe
 */
export async function ensureDetectionConfig(db) {
  console.log('🔍 Verificando configuración de detección...');
  
  const configDoc = await getDocs(collection(db, 'config'));
  const hasConfig = configDoc.docs.some((d) => d.id === 'detection');
  
  if (hasConfig) {
    console.log('   ✅ Configuración encontrada');
    return;
  }

  console.log('   ⚠️  No hay configuración. Creando configuración de detección...');
  
  const config = {
    enableRansomwareDetection: true,
    enableIntrusionDetection: true,
    enableDataLeakPrevention: true,
    enableAnomalyDetection: true,
    suspiciousProcesses: [
      'crypt',
      'encrypt',
      'locky',
      'wannacry',
      'petya',
      'notpetya',
      'cerber',
      'lockbit',
      'revil',
      'maze',
      'ryuk',
      'sodinokibi',
    ],
    detectionInterval: 60, // segundos
  };

  await setDoc(doc(db, 'config', 'detection'), config);
  console.log('   ✅ Configuración de detección creada');
}

/**
 * Verifica y crea métricas básicas para los servidores si no existen
 */
export async function ensureBasicMetrics(db, servers) {
  console.log('🔍 Verificando métricas de servidores...');
  
  let totalMetrics = 0;
  for (const server of servers) {
    const metricsSnapshot = await getDocs(
      collection(db, 'servers', server.id, 'metrics')
    );
    totalMetrics += metricsSnapshot.size;
  }

  if (totalMetrics > 0) {
    console.log(`   ✅ Encontradas ${totalMetrics} métrica(s)`);
    return;
  }

  console.log('   ⚠️  No hay métricas. Creando métricas básicas...');
  
  const now = new Date();
  const timestamp = Timestamp.fromDate(now);

  for (const server of servers) {
    const basicMetrics = {
      cpuUsage: 30 + Math.floor(Math.random() * 40),
      memoryUsage: 40 + Math.floor(Math.random() * 40),
      diskUsage: 30 + Math.floor(Math.random() * 40),
      networkIn: 10 * 1024 * 1024, // 10 MB
      networkOut: 5 * 1024 * 1024, // 5 MB
      activeConnections: Math.floor(Math.random() * 20) + 5,
      failedLoginAttempts: 0,
      processes: [],
      fileChanges: [],
      networkConnections: [],
      timestamp: timestamp,
    };

    await addDoc(collection(db, 'servers', server.id, 'metrics'), basicMetrics);
    console.log(`   ✅ Métricas básicas creadas para: ${server.name}`);
  }

  console.log(`   ✅ Métricas básicas creadas para ${servers.length} servidor(es)`);
}

/**
 * Función principal que verifica y crea todos los datos necesarios
 */
export async function ensureAllData(db) {
  console.log('\n📋 Verificando y creando datos necesarios...\n');
  
  const servers = await ensureServers(db);
  await ensureDetectionConfig(db);
  await ensureBasicMetrics(db, servers);
  
  console.log('\n✅ Todos los datos están disponibles\n');
  
  return { servers };
}

