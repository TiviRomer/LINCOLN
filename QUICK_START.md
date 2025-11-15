# 🚀 Guía de Inicio Rápido - LINCOLN con Firebase

## ✅ Prerequisitos

Asegúrate de tener instalado:
- Node.js 18+ 
- npm
- Firebase CLI (`npm install -g firebase-tools`)

## 📋 Pasos para Iniciar

### Opción 1A: PowerShell (Windows - Recomendado)

```powershell
.\start.ps1
```

Este script:
- ✅ Limpia automáticamente puertos ocupados
- ✅ Verifica que no haya conflictos
- 🔥 Inicia emuladores de Firebase
- ⚛️ Inicia Frontend React
- 💾 **Persistencia de datos activada**

### Opción 1B: Node (Multiplataforma)

```bash
node start-dev.js
```

Este script iniciará automáticamente:
- 🔥 Emuladores de Firebase (Auth, Firestore, Functions)
- ⚛️  Frontend React (puerto 3000)
- 💾 **Persistencia de datos activada**

### Opción 2: Manual

#### Terminal 1 - Emuladores de Firebase
```bash
firebase emulators:start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 🌐 URLs Disponibles

Una vez iniciado, tendrás acceso a:

- **Frontend**: http://localhost:3000
- **Firebase UI**: http://localhost:4001 (Panel de emuladores)
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8082
- **Functions Emulator**: http://localhost:5001

## 🔍 Configurar Sistema de Detección (NUEVO)

Después de iniciar el sistema, configura las detecciones:

```powershell
# 1. Configurar detección
node scripts/setup-detection-config.js

# 2. Poblar datos de prueba (si no lo has hecho)
node scripts/populate-firestore.js

# 3. Poblar métricas de servidores (IMPORTANTE para detecciones)
node scripts/populate-server-metrics.js

# 4. Probar el sistema de detección
node scripts/test-detection.js
```

Las detecciones se ejecutarán automáticamente cada minuto y crearán alertas cuando detecten amenazas.

📖 **Ver guía completa**: `DETECCION_SETUP.md`

## 🧪 Probar el Sistema

### 1. Crear una Cuenta

1. Abre http://localhost:3000
2. Haz clic en "Regístrate"
3. Completa el formulario:
   - **Nombre**: Tu nombre
   - **Email**: cualquier email (ejemplo@test.com)
   - **Contraseña**: Mínimo 6 caracteres
4. Acepta términos y condiciones
5. Haz clic en "Crear Cuenta"

✅ Deberías ser redirigido automáticamente al Dashboard

### 2. Cerrar Sesión

1. En el Dashboard, haz clic en tu avatar/nombre en la esquina superior derecha
2. Selecciona "Cerrar Sesión"

✅ Deberías ser redirigido a la página de Login

### 3. Iniciar Sesión

1. En la página de Login, ingresa:
   - **Email**: El email que registraste
   - **Contraseña**: Tu contraseña
2. Haz clic en "Iniciar Sesión"

✅ Deberías acceder al Dashboard nuevamente

## 🔍 Verificar en Firebase UI

1. Abre http://localhost:4000
2. Ve a la sección **Authentication**
   - Verás los usuarios registrados
3. Ve a la sección **Firestore**
   - Verás la colección `users` con los perfiles

## 🛠️ Funcionalidades Implementadas

### ✅ Autenticación
- [x] Registro de usuarios con Firebase Auth
- [x] Login con email y contraseña
- [x] Logout
- [x] Protección de rutas (Dashboard requiere autenticación)
- [x] Contexto de autenticación global
- [x] Perfiles de usuario en Firestore

### ✅ Dashboard
- [x] Vista de métricas (datos mock)
- [x] Monitoreo de amenazas (datos mock)
- [x] Estado de servidores (datos mock)
- [x] Alertas activas (datos mock)
- [x] Acciones rápidas
- [x] Salud del sistema

### 🔄 En Progreso
- [ ] Integración con backend C++ para detección real
- [ ] Integración con backend Go para APIs adicionales
- [ ] Datos reales desde Firestore
- [ ] Sistema de alertas en tiempo real
- [ ] Notificaciones push

## ⚠️ Notas Importantes

### Persistencia de Datos

**✅ TUS DATOS SE GUARDAN AUTOMÁTICAMENTE:**
- Cuando usas `node start-dev.js`, la persistencia está activada
- Al cerrar con `Ctrl+C`, los datos se exportan a `./emulator-data`
- La próxima vez que inicies, tus usuarios y datos seguirán ahí

**⚠️ IMPORTANTE para que se guarden los datos:**

**Si usas `.\start.ps1` o `node start-dev.js`:**
1. Presiona `Ctrl+C` **UNA SOLA VEZ** en la terminal
2. **ESPERA** a que termine la exportación (verás mensajes en consola)
3. No cierres la ventana bruscamente
4. Verás mensajes como:
   ```
   💾 Exportando datos a ./emulator-data...
   ✅ Todos los servicios detenidos correctamente
   💾 Datos exportados a ./emulator-data
   ```

**❌ NO uses estos métodos para cerrar:**
- ❌ NO cierres la ventana de PowerShell/Terminal directamente
- ❌ NO ejecutes `.\stop.ps1` (solo en emergencias, NO guarda datos)
- ❌ NO uses el Task Manager para matar procesos

### Emuladores vs Producción

**Actualmente usando EMULADORES** (desarrollo local):
- Los datos persisten localmente en `./emulator-data`
- No necesitas credenciales reales de Firebase
- Todo corre en tu máquina local

**Para producción** necesitarás:
1. Crear un proyecto en Firebase Console
2. Obtener las credenciales reales
3. Configurar variables de entorno en `.env.local`
4. Desplegar a Firebase Hosting

### Datos de Prueba

Los datos del Dashboard son actualmente **MOCK DATA** (ficticios). En una implementación real:
- Los servidores serían monitoreados por agentes reales
- Las amenazas serían detectadas por el backend C++
- Las alertas se crearían a través de Firebase Functions
- Los datos se almacenarían en Firestore

## 🐛 Solución de Problemas

### Error: "Cannot connect to Firebase Emulators"

**Solución:**
1. Verifica que los emuladores estén corriendo
2. Revisa http://localhost:4000 - deberías ver la UI de Firebase
3. Reinicia los emuladores: `Ctrl+C` y vuelve a ejecutar

### Error: "Port 3000 is already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Error: "Firebase CLI not found"

**Solución:**
```bash
npm install -g firebase-tools
```

### Los cambios no se reflejan

**Solución:**
1. Haz un hard refresh: `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
2. Limpia caché: `Ctrl+Shift+Del`
3. Revisa la consola del navegador (F12) para errores

### Quiero empezar desde cero (borrar todos los datos)

**Solución:**
1. Detén los emuladores (`Ctrl+C`)
2. Borra el contenido de la carpeta `emulator-data`:
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force .\emulator-data\*
   
   # Windows CMD o Git Bash
   rmdir /s /q emulator-data\auth_export
   rmdir /s /q emulator-data\firestore_export
   
   # Linux/Mac
   rm -rf emulator-data/auth_export emulator-data/firestore_export
   ```
3. Reinicia con `node start-dev.js`

## 📚 Próximos Pasos

1. ✅ **Ya tienes autenticación funcional con Firebase**
2. 📊 Siguiente: Implementar datos reales desde Firestore
3. 🔔 Después: Sistema de notificaciones en tiempo real
4. 🔒 Luego: Integrar backend C++ para detección de amenazas

## 💡 Consejos

- Usa Chrome DevTools (F12) para ver logs y errores
- Revisa Firebase UI (localhost:4000) para inspeccionar datos
- Los emuladores se resetean cada vez que los reinicias
- Para persistir datos entre reinicios, usa: `firebase emulators:start --import=./emulator-data --export-on-exit`

## 🎉 ¡Todo Listo!

Tu sistema LINCOLN con Firebase está **100% funcional** para desarrollo. 

¡Empieza a crear usuarios y explora el Dashboard! 🚀

