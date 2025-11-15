# ⚡ Inicio Rápido - LINCOLN

## 🚀 LA FORMA MÁS FÁCIL (Recomendada)

### **PowerShell:**

```powershell
.\start.ps1
```

✅ **Este script hace TODO automáticamente:**
1. Limpia procesos previos
2. Verifica que los puertos estén libres
3. Inicia Firebase y Frontend
4. ¡Listo para usar!

---

## 📋 Alternativas

### **Opción 2: Node.js directo**

```bash
node start-dev.js
```

⚠️ **Advertencia:** Si falla por puertos ocupados, usa `.\start.ps1` en su lugar.

---

## 🌐 URLs del Sistema

Una vez iniciado:

| Servicio | URL |
|----------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔥 Firebase UI | http://localhost:4000 |
| 🔐 Auth | http://localhost:9099 |
| 📊 Firestore | http://localhost:8082 |
| ⚡ Functions | http://localhost:5001 |

---

## 🎯 Flujo Completo

### **1. Iniciar (Primera Vez)**

```powershell
# Permite ejecutar scripts (solo la primera vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Inicia el sistema
.\start.ps1
```

### **2. Trabajar**

Abre http://localhost:3000 y:
- Regístrate con cualquier email
- Inicia sesión
- Explora el Dashboard

### **3. Detener**

```
Presiona Ctrl+C
Espera 2-3 segundos
✅ Todo cerrado automáticamente
```

### **4. Reiniciar**

```powershell
.\start.ps1
```

---

## 🆘 Solución de Problemas

### **Error: "Port X is not open"**

**Solución:**
```powershell
# Usa el script de PowerShell que limpia automáticamente
.\start.ps1
```

### **Error: "Cannot execute scripts"**

**Solución:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\start.ps1
```

### **Los cambios no se ven en el navegador**

**Solución:**
```
Ctrl + Shift + R  (hard refresh)
```

### **Todo falla, quiero empezar de cero**

**Solución:**
```powershell
# Cerrar TODO
Get-Process node,java -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar
.\start.ps1
```

---

## 📊 Comparación de Métodos

| Método | Ventajas | Desventajas |
|--------|----------|-------------|
| `.\start.ps1` | ✅ Limpia automáticamente<br>✅ Verifica puertos<br>✅ Siempre funciona | ⚠️ Solo PowerShell |
| `node start-dev.js` | ✅ Multiplataforma<br>✅ Más rápido | ⚠️ Puede fallar si hay procesos previos |
| `.\restart-lincoln.ps1` | ✅ Limpieza profunda<br>✅ Interactivo | ⚠️ Más lento |

---

## 💡 Recomendación

**Usa siempre `.\start.ps1` para evitar problemas** 🎯

Es el método más confiable y hace toda la limpieza automáticamente.

---

## ✅ Checklist de Verificación

Después de iniciar, verifica:

- [ ] No hay errores en la terminal
- [ ] http://localhost:3000 carga correctamente
- [ ] Ves la página de inicio de LINCOLN
- [ ] Puedes hacer clic en "Regístrate"
- [ ] http://localhost:4000 muestra Firebase UI

Si todos están ✅, ¡estás listo! 🎉

---

## 🎓 Mejores Prácticas

### **Siempre que inicies:**
```powershell
.\start.ps1
```

### **Siempre que detengas:**
```
Ctrl+C (espera 2-3 segundos)
```

### **Si algo falla:**
```powershell
.\start.ps1
# El script limpia automáticamente
```

---

## 🚀 ¡Listo!

Con `.\start.ps1` nunca más tendrás problemas de puertos ocupados.

**Próximo paso:**
```powershell
.\start.ps1
```

Luego abre: **http://localhost:3000** 🎉

