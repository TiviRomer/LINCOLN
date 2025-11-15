# 🔄 Reiniciar Sistema Limpiamente

## 🎯 Problema

Los procesos anteriores no se cerraron completamente y ocupan los puertos.

---

## ✅ SOLUCIÓN RÁPIDA (3 pasos)

### **PASO 1: Cerrar Todo**

Abre **PowerShell** y ejecuta:

```powershell
.\cleanup.ps1
```

**Si dice "no se puede ejecutar scripts":**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\cleanup.ps1
```

Este script cerrará automáticamente:
- ✅ Todos los procesos en los puertos necesarios (3000, 4000, 5000, 5001, 8081, 9099)
- ✅ Procesos de Node.js relacionados con LINCOLN
- ✅ Emuladores de Firebase (Java)

---

### **PASO 2: Verificar que Todo Está Cerrado**

```powershell
netstat -ano | findstr "3000 4000 5001 8081 9099"
```

**Resultado esperado:** No debería mostrar nada (o muy pocas líneas sin "LISTENING")

---

### **PASO 3: Iniciar de Nuevo**

```bash
node start-dev.js
```

---

## 🔧 SOLUCIÓN MANUAL (Si el script no funciona)

### Opción A: Cerrar TODO Node.js

```powershell
# ⚠️ ADVERTENCIA: Esto cerrará TODOS los procesos de Node
taskkill /F /IM node.exe
taskkill /F /IM java.exe
```

### Opción B: Cerrar Puerto por Puerto

```powershell
# Puerto 3000 (Frontend)
netstat -ano | findstr :3000
taskkill /PID <número> /F

# Puerto 4000 (Firebase UI)
netstat -ano | findstr :4000
taskkill /PID <número> /F

# Puerto 5001 (Functions)
netstat -ano | findstr :5001
taskkill /PID <número> /F

# Puerto 8081 (Firestore)
netstat -ano | findstr :8081
taskkill /PID <número> /F

# Puerto 9099 (Auth)
netstat -ano | findstr :9099
taskkill /PID <número> /F
```

---

## 🚀 FLUJO COMPLETO DE REINICIO

### Desde Cero (Cada Vez que Inicies)

```powershell
# 1. Limpiar procesos
.\cleanup.ps1

# 2. Esperar 2 segundos
Start-Sleep -Seconds 2

# 3. Iniciar sistema
node start-dev.js
```

---

## 💡 SCRIPT AUTOMÁTICO TODO-EN-UNO

Voy a crear un script que haga todo automáticamente:

```powershell
# restart-lincoln.ps1
# Este script limpia y reinicia todo

Write-Host "🧹 Paso 1: Limpiando procesos..." -ForegroundColor Yellow
.\cleanup.ps1

Write-Host ""
Write-Host "⏳ Esperando 3 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🚀 Paso 2: Iniciando LINCOLN..." -ForegroundColor Green
node start-dev.js
```

---

## ⚠️ ERRORES COMUNES

### Error: "No se puede ejecutar scripts de PowerShell"

**Solución:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

Luego vuelve a ejecutar el script.

---

### Error: "Acceso denegado"

**Solución:** Ejecuta PowerShell como **Administrador**

1. Busca "PowerShell" en el menú inicio
2. Clic derecho → "Ejecutar como administrador"
3. Navega a tu carpeta: `cd C:\Programacion\LINCOLN`
4. Ejecuta: `.\cleanup.ps1`

---

### Error: "El puerto todavía está en uso"

Esto significa que hay un proceso muy persistente. 

**Solución nuclear:**
```powershell
# Cerrar TODO Node y Java
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "java" | Stop-Process -Force
```

Espera 5 segundos y luego inicia de nuevo.

---

### Problemas con el Administrador de Tareas

Si prefieres la interfaz gráfica:

1. Abre **Administrador de Tareas** (`Ctrl + Shift + Esc`)
2. Ve a la pestaña **"Detalles"**
3. Busca y finaliza:
   - Todos los procesos **"node.exe"**
   - Todos los procesos **"java.exe"** (que sean de Firebase)
4. Cierra el Administrador de Tareas
5. Ejecuta: `node start-dev.js`

---

## 🎯 MEJOR PRÁCTICA

### Para Detener el Sistema Correctamente

Cuando quieras detener LINCOLN:

1. **Presiona `Ctrl + C` en la terminal** donde corre `start-dev.js`
2. **Espera 3-5 segundos** para que cierre limpiamente
3. Si no se cierra, presiona `Ctrl + C` de nuevo
4. Como último recurso, ejecuta: `.\cleanup.ps1`

---

## 📊 Verificación Final

Después de limpiar y antes de iniciar, verifica:

```powershell
# Deberían estar vacíos (o casi vacíos):
netstat -ano | findstr ":3000"   # Frontend
netstat -ano | findstr ":4000"   # Firebase UI
netstat -ano | findstr ":5001"   # Functions
netstat -ano | findstr ":8081"   # Firestore
netstat -ano | findstr ":9099"   # Auth
```

Si todos están libres, puedes iniciar sin problemas.

---

## 🔄 RESUMEN VISUAL

```
┌─────────────────────────────────┐
│  1. .\cleanup.ps1               │  ← Limpia todo
├─────────────────────────────────┤
│  2. Esperar 2-3 segundos        │  ← Deja que los procesos terminen
├─────────────────────────────────┤
│  3. node start-dev.js           │  ← Inicia limpiamente
├─────────────────────────────────┤
│  4. Abrir http://localhost:3000 │  ← Prueba la app
└─────────────────────────────────┘
```

---

## ✅ CHECKLIST

Antes de iniciar, asegúrate de:

- [ ] Ejecutaste `.\cleanup.ps1`
- [ ] Esperaste al menos 2 segundos
- [ ] Verificaste que los puertos están libres
- [ ] No hay otras instancias de Node corriendo
- [ ] Estás en el directorio correcto (`C:\Programacion\LINCOLN`)

---

## 🎉 ¡Listo!

Con estos pasos, deberías poder reiniciar LINCOLN limpiamente cada vez.

**Comando rápido para el día a día:**
```powershell
.\cleanup.ps1; Start-Sleep -Seconds 2; node start-dev.js
```

Esto hace todo en una sola línea! 🚀

