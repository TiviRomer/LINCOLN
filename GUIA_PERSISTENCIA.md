# 💾 Guía Completa de Persistencia de Datos - LINCOLN

## 📌 Resumen

**Tu configuración actual:**
- ✅ Usando: `.\start.ps1` (PowerShell)
- ✅ Persistencia: **Activada automáticamente**
- ✅ Datos se guardan en: `./emulator-data/`

---

## 🚀 Cómo Iniciar (Con Persistencia)

### Windows PowerShell (Tu método actual):

```powershell
.\start.ps1
```

**Lo que hace:**
1. ✅ Limpia puertos ocupados automáticamente
2. ✅ Verifica que no haya conflictos
3. ✅ Inicia Firebase Emulators con persistencia
4. ✅ Inicia Frontend React
5. ✅ Muestra URLs de todos los servicios

**Ventajas:**
- No más conflictos de puertos
- No necesitas cerrar manualmente procesos previos
- Persistencia activada por defecto

---

## 🛑 Cómo Cerrar CORRECTAMENTE (Para Guardar Datos)

### ✅ MÉTODO CORRECTO - Con Ctrl+C

**Paso a Paso:**

1. **Ve a la terminal donde ejecutaste `.\start.ps1`**

2. **Presiona `Ctrl+C` UNA SOLA VEZ**
   - No lo presiones múltiples veces
   - No cierres la ventana

3. **ESPERA** - Verás estos mensajes:
   ```
   🛑 Deteniendo todos los servicios...
   💾 Exportando datos a ./emulator-data (esto puede tardar unos segundos)...
   
   ⏹️  Cerrando 🔥 Firebase...
   ✅ 🔥 Firebase cerrado
   
   ⏹️  Cerrando ⚛️  React...
   ✅ ⚛️  React cerrado
   
   ✅ Todos los servicios detenidos correctamente
   💾 Datos exportados a ./emulator-data
      (Se cargarán automáticamente en el próximo inicio)
   
   👋 ¡Hasta pronto!
   ```

4. **¡Listo!** Tus datos están guardados

---

## ❌ Métodos INCORRECTOS (Pierdes los Datos)

### ❌ Cerrar la Ventana Directamente
- Click en la X de PowerShell
- **Resultado:** Datos NO se guardan

### ❌ Usar stop.ps1
```powershell
.\stop.ps1  # ❌ NO GUARDAR DATOS
```
- Solo para emergencias
- Mata procesos forzadamente
- **Resultado:** Datos NO se guardan

### ❌ Usar Task Manager
- Matar procesos manualmente
- **Resultado:** Datos NO se guardan

### ❌ Presionar Ctrl+C múltiples veces
- Interrumpe la exportación
- **Resultado:** Datos pueden perderse

---

## 🔍 Verificar que la Persistencia Funciona

### Test Completo:

**1. Primera sesión - Crear datos:**
```powershell
# Paso 1: Inicia
.\start.ps1

# Paso 2: Abre http://localhost:3000

# Paso 3: Registra un usuario
Email: test@ejemplo.com
Contraseña: 123456

# Paso 4: Cierra CORRECTAMENTE
# En la terminal: Ctrl+C (una vez) y ESPERA
```

**2. Verificar exportación:**
```powershell
# Verifica que existen estos archivos:
ls .\emulator-data\

# Deberías ver:
# - auth_export/
# - firestore_export/
# - README.md
```

**3. Segunda sesión - Verificar persistencia:**
```powershell
# Paso 1: Inicia nuevamente
.\start.ps1

# Paso 2: Ve a Login
# http://localhost:3000/login

# Paso 3: Inicia sesión con:
Email: test@ejemplo.com
Contraseña: 123456

# ✅ Si funciona: PERSISTENCIA OK
# ❌ Si dice "usuario no existe": Datos no se guardaron
```

---

## 📁 Estructura de Datos

Después de cerrar correctamente, tendrás:

```
emulator-data/
├── README.md                    (Documentación)
├── auth_export/
│   └── accounts.json           (👥 Usuarios registrados)
└── firestore_export/
    ├── all_namespaces/         (📊 Datos de Firestore)
    └── firestore_export.overall_export_metadata
```

---

## 🆘 Solución de Problemas

### ❓ "Los datos no se guardaron"

**Diagnóstico:**
1. ¿Cerraste con `Ctrl+C` una sola vez?
2. ¿Esperaste a ver los mensajes de exportación?
3. ¿Existe la carpeta `emulator-data/auth_export`?

**Solución:**
- Vuelve a iniciar: `.\start.ps1`
- Registra un usuario de prueba
- Cierra correctamente con `Ctrl+C`
- Espera los mensajes
- Verifica: `ls .\emulator-data\auth_export\`

### ❓ "Quiero empezar desde cero"

**Borrar todos los datos:**
```powershell
# Opción 1: Borrar todo
Remove-Item -Recurse -Force .\emulator-data\auth_export, .\emulator-data\firestore_export

# Opción 2: Borrar solo usuarios
Remove-Item -Recurse -Force .\emulator-data\auth_export

# Opción 3: Borrar solo datos de Firestore
Remove-Item -Recurse -Force .\emulator-data\firestore_export
```

### ❓ "Tengo conflictos de puertos"

**El start.ps1 ya los maneja automáticamente**, pero si persisten:

```powershell
# Ver qué está usando los puertos:
netstat -ano | findstr "3000 4000 5001 8082 9099"

# Cerrar procesos manualmente:
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "java" | Stop-Process -Force

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar nuevamente
.\start.ps1
```

### ❓ "La exportación está tardando mucho"

**Es normal si tienes muchos datos**, pero:
- ⏱️ Normalmente: 2-5 segundos
- 🐌 Si tarda más de 30 segundos: Algo está mal

**Solución si se congela:**
1. Presiona `Ctrl+C` una vez más
2. Espera 10 segundos
3. Si no responde, cierra la ventana
4. Ejecuta: `.\stop.ps1`
5. Reinicia: `.\start.ps1`

---

## 📝 Comandos Útiles

```powershell
# Iniciar (con persistencia)
.\start.ps1

# Ver datos guardados
ls .\emulator-data\

# Ver usuarios guardados (JSON)
cat .\emulator-data\auth_export\accounts.json

# Borrar todos los datos
Remove-Item -Recurse -Force .\emulator-data\auth_export, .\emulator-data\firestore_export

# Forzar cierre (emergencia - NO guarda)
.\stop.ps1

# Ver procesos activos
Get-Process -Name "node","java"

# Ver puertos en uso
netstat -ano | findstr "3000 4000 5001 8082 9099"
```

---

## 🎯 Mejores Prácticas

### ✅ Hacer:
- ✅ Usar `.\start.ps1` para iniciar
- ✅ Cerrar con `Ctrl+C` una vez
- ✅ Esperar a que termine la exportación
- ✅ Verificar mensajes de confirmación

### ❌ No Hacer:
- ❌ Cerrar la ventana directamente
- ❌ Usar Task Manager
- ❌ Presionar Ctrl+C múltiples veces
- ❌ Usar `.\stop.ps1` regularmente

---

## 💡 Datos Importantes

### ¿Qué se guarda?
- ✅ **Usuarios registrados** (email, contraseña hash, perfil)
- ✅ **Sesiones activas**
- ✅ **Datos de Firestore** (cuando los agregues)
- ✅ **Configuración de emuladores**

### ¿Qué NO se guarda?
- ❌ Logs de consola
- ❌ Estado de la aplicación React
- ❌ Memoria caché del navegador
- ❌ Variables temporales

### ¿Dónde NO se sube?
- 📁 Los datos están en **`.gitignore`**
- 🔒 Son **locales** a tu máquina
- 🚫 **NO se suben** a GitHub
- 💻 Cada desarrollador tiene sus propios datos

---

## 🔐 Seguridad

- ✅ Los datos son solo para desarrollo local
- ✅ No uses contraseñas reales
- ✅ Los datos no se sincronizan con producción
- ✅ Puedes borrarlos cuando quieras

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir esta guía aún tienes problemas:

1. Verifica los logs en la terminal
2. Revisa que `emulator-data/` exista
3. Comprueba que no haya errores de permisos
4. Intenta borrar todo y empezar desde cero

---

**Última actualización:** 15 de Noviembre, 2025
**Script:** `start.ps1` + `start-dev.js`
**Persistencia:** ✅ Activada por defecto

