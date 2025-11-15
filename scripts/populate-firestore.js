/**
 * Script para poblar Firestore con datos de prueba
 * Ejecutar con: node scripts/populate-firestore.js
 * Asegúrate de que los emuladores estén corriendo
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp, Timestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Configuración de Firebase para emuladores
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-lincoln',
  storageBucket: 'demo-lincoln.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456'
};

console.log('🔥 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Conectar a emuladores
console.log('🔌 Conectando a emuladores...');
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
connectFirestoreEmulator(db, 'localhost', 8082);
console.log('✅ Conectado a emuladores');

// Función para generar timestamp aleatorio en las últimas X horas
const randomTimestamp = (hoursAgo) => {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
};

// Función para generar número aleatorio
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function populateFirestore() {
  try {
    console.log('\n📊 Poblando Firestore con datos de prueba...\n');

    // ===== SERVIDORES =====
    console.log('🖥️  Creando servidores...');
    
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
        cpuUsage: randomInt(20, 60),
        memoryUsage: randomInt(40, 80),
        diskUsage: randomInt(30, 70),
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
        cpuUsage: randomInt(60, 90),
        memoryUsage: randomInt(70, 95),
        diskUsage: randomInt(40, 60),
        tags: ['production', 'database', 'critical'],
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        name: 'Servidor de Archivos',
        ipAddress: '192.168.1.12',
        hostname: 'srv-files-01',
        os: 'Windows Server',
        osVersion: '2022',
        environment: 'production',
        department: 'IT',
        isActive: true,
        status: 'warning',
        location: 'Centro de Datos B',
        cpuUsage: randomInt(80, 95),
        memoryUsage: randomInt(75, 90),
        diskUsage: randomInt(70, 85),
        tags: ['production', 'file-server'],
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        name: 'Servidor de Desarrollo',
        ipAddress: '192.168.1.13',
        hostname: 'srv-dev-01',
        os: 'Ubuntu Server',
        osVersion: '22.04 LTS',
        environment: 'development',
        department: 'Desarrollo',
        isActive: true,
        status: 'online',
        location: 'Centro de Datos B',
        cpuUsage: randomInt(10, 40),
        memoryUsage: randomInt(30, 60),
        diskUsage: randomInt(40, 60),
        tags: ['development', 'test'],
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        name: 'Servidor Web Secundario',
        ipAddress: '192.168.1.14',
        hostname: 'srv-web-02',
        os: 'CentOS',
        osVersion: '8',
        environment: 'production',
        department: 'IT',
        isActive: true,
        status: 'online',
        location: 'Centro de Datos A',
        cpuUsage: randomInt(20, 50),
        memoryUsage: randomInt(40, 70),
        diskUsage: randomInt(35, 55),
        tags: ['production', 'web-server', 'backup'],
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    const serverIds = {};
    for (const server of servers) {
      const docRef = await addDoc(collection(db, 'servers'), server);
      serverIds[server.name] = docRef.id;
      console.log(`   ✅ ${server.name} - ${docRef.id}`);
    }

    // ===== ALERTAS =====
    console.log('\n🚨 Creando alertas...');
    
    const alerts = [
      {
        title: 'Intento de Ransomware Detectado',
        description: 'Proceso sospechoso intentando cifrar archivos en /var/www. Patrón de comportamiento coincide con ransomware conocido.',
        type: 'ransomware',
        severity: 'critical',
        serverId: serverIds['Servidor Principal'],
        serverName: 'Servidor Principal',
        status: 'open',
        source: 'Sistema de Detección',
        assignedTo: null,
        createdBy: 'system',
        department: 'IT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        title: 'Intento de Intrusión',
        description: 'Múltiples intentos de acceso fallidos desde IP externa 203.45.67.89. Posible ataque de fuerza bruta.',
        type: 'intrusion',
        severity: 'high',
        serverId: serverIds['Servidor de Base de Datos'],
        serverName: 'Servidor de Base de Datos',
        status: 'acknowledged',
        source: 'Firewall',
        assignedTo: null,
        createdBy: 'system',
        department: 'IT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        title: 'Posible Filtración de Datos',
        description: 'Transferencia masiva de archivos detectada (2.5GB) hacia destino externo no autorizado.',
        type: 'data_leak',
        severity: 'high',
        serverId: serverIds['Servidor de Archivos'],
        serverName: 'Servidor de Archivos',
        status: 'open',
        source: 'DLP System',
        assignedTo: null,
        createdBy: 'system',
        department: 'IT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        title: 'Comportamiento Anómalo de CPU',
        description: 'Actividad de CPU inusualmente alta detectada. Proceso desconocido consumiendo 85% de recursos.',
        type: 'anomalous_behavior',
        severity: 'medium',
        serverId: serverIds['Servidor Principal'],
        serverName: 'Servidor Principal',
        status: 'open',
        source: 'Monitor de Recursos',
        assignedTo: null,
        createdBy: 'system',
        department: 'IT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        title: 'Acceso No Autorizado a Base de Datos',
        description: 'Intento de acceso desde cuenta no autorizada a tablas críticas de la base de datos.',
        type: 'intrusion',
        severity: 'critical',
        serverId: serverIds['Servidor de Base de Datos'],
        serverName: 'Servidor de Base de Datos',
        status: 'in_progress',
        source: 'DB Audit Log',
        assignedTo: null,
        createdBy: 'system',
        department: 'IT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        title: 'Malware Detectado',
        description: 'Archivo malicioso detectado en directorio /tmp. Antivirus lo ha puesto en cuarentena.',
        type: 'malware',
        severity: 'medium',
        serverId: serverIds['Servidor de Desarrollo'],
        serverName: 'Servidor de Desarrollo',
        status: 'resolved',
        source: 'Antivirus',
        assignedTo: null,
        createdBy: 'system',
        department: 'Desarrollo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const alert of alerts) {
      const docRef = await addDoc(collection(db, 'alerts'), alert);
      console.log(`   ✅ ${alert.title} - ${docRef.id}`);
    }

    // ===== CONFIGURACIÓN DEL SISTEMA =====
    console.log('\n⚙️  Creando configuración del sistema...');
    
    await setDoc(doc(db, 'config', 'system'), {
      systemName: 'LINCOLN',
      version: '1.0.0',
      initialized: true,
      lastUpdate: serverTimestamp(),
      settings: {
        alertRetentionDays: 90,
        logRetentionDays: 30,
        autoResolveInactiveDays: 7,
        emailNotifications: true,
        realTimeMonitoring: true,
      },
    });
    console.log('   ✅ Configuración del sistema creada');

    // ===== ESTADÍSTICAS =====
    console.log('\n📈 Creando estadísticas iniciales...');
    
    await setDoc(doc(db, 'stats', 'current'), {
      totalAlerts: alerts.length,
      totalServers: servers.length,
      totalUsers: 1,
      lastUpdated: serverTimestamp(),
    });
    console.log('   ✅ Estadísticas iniciales creadas');

    // ===== INCIDENTES =====
    console.log('\n🚨 Creando incidentes...');
    
    const incidents = [
      {
        title: 'Ataque de Ransomware en Servidor Principal',
        type: 'ransomware',
        severity: 'critical',
        status: 'investigating',
        affectedServers: [serverIds['Servidor Principal'], serverIds['Servidor de Base de Datos']],
        detectedAt: serverTimestamp(),
        automatedResponses: [
          'Aislamiento automático del servidor afectado',
          'Backup de seguridad activado',
          'Notificación enviada al equipo de seguridad'
        ],
        manualActions: [
          'Análisis forense iniciado',
          'Contacto con proveedor de seguridad'
        ],
        timeline: [
          {
            timestamp: Timestamp.fromDate(new Date()),
            action: 'detected',
            actor: 'system',
            description: 'Ransomware detectado en /var/www del servidor principal'
          },
          {
            timestamp: Timestamp.fromDate(new Date()),
            action: 'automated_response',
            actor: 'system',
            description: 'Servidor aislado automáticamente de la red'
          },
          {
            timestamp: Timestamp.fromDate(new Date()),
            action: 'investigating',
            actor: 'admin',
            description: 'Investigación iniciada por el equipo de seguridad'
          }
        ],
        createdBy: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        title: 'Intento de Intrusión Múltiple',
        type: 'intrusion',
        severity: 'high',
        status: 'contained',
        affectedServers: [serverIds['Servidor de Base de Datos']],
        detectedAt: serverTimestamp(),
        resolvedAt: serverTimestamp(),
        automatedResponses: [
          'IP bloqueada automáticamente',
          'Firewall actualizado',
          'Logs de seguridad generados'
        ],
        manualActions: [
          'Análisis de logs completado',
          'Reglas de firewall actualizadas'
        ],
        timeline: [
          {
            timestamp: Timestamp.fromDate(new Date()),
            action: 'detected',
            actor: 'system',
            description: 'Múltiples intentos de acceso fallidos desde IP externa'
          },
          {
            timestamp: Timestamp.fromDate(new Date()),
            action: 'contained',
            actor: 'system',
            description: 'Amenaza contenida - IP bloqueada'
          },
          {
            timestamp: Timestamp.fromDate(new Date()),
            action: 'resolved',
            actor: 'admin',
            description: 'Incidente resuelto - Sistema seguro'
          }
        ],
        createdBy: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        title: 'Posible Filtración de Datos',
        type: 'data_leak',
        severity: 'critical',
        status: 'active',
        affectedServers: [serverIds['Servidor de Archivos']],
        detectedAt: serverTimestamp(),
        automatedResponses: [
          'Transferencia bloqueada',
          'Conexión externa interrumpida',
          'Alerta enviada al administrador'
        ],
        manualActions: [],
        timeline: [
          {
            timestamp: Timestamp.fromDate(new Date()),
            action: 'detected',
            actor: 'system',
            description: 'Transferencia masiva de datos detectada (2.5GB)'
          }
        ],
        createdBy: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    ];

    for (const incident of incidents) {
      const docRef = await addDoc(collection(db, 'incidents'), incident);
      console.log(`   ✅ ${incident.title} - ${docRef.id}`);
    }

    console.log('\n========================================');
    console.log('✅ FIRESTORE POBLADO EXITOSAMENTE');
    console.log('========================================\n');
    console.log('📊 Datos creados:');
    console.log(`   - Servidores: ${servers.length}`);
    console.log(`   - Alertas: ${alerts.length}`);
    console.log(`   - Incidentes: ${incidents.length}`);
    console.log('   - Configuración del sistema: 1');
    console.log('   - Estadísticas: 1');
    console.log('\n🌐 Verifica los datos en:');
    console.log('   - http://localhost:4001/firestore');
    console.log('\n💡 Ahora recarga tu Dashboard: http://localhost:3000/dashboard');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al poblar Firestore:', error);
    console.error(error.message);
    console.log('\n💡 Asegúrate de que los emuladores estén corriendo:');
    console.log('   .\start-simple-no-functions.ps1\n');
    process.exit(1);
  }
}

// Esperar un momento antes de empezar
setTimeout(() => {
  populateFirestore();
}, 1000);

