# Troubleshooting Guide

## "Internal Server Error" Issue

If you're seeing "Internal Server Error", follow these steps:

### 1. Rebuild the Backend

The updated code has better error handling. Rebuild to see detailed error messages:

```powershell
cd backend\c++
.\build.ps1
```

### 2. Check Backend Console Output

When you start the backend server, you should see:
```
========================================
  LINCOLN API Server
  Version: 0.1.0
========================================
Initializing database at: data/lincoln.db
Database directory created/verified: data
Opening database: data/lincoln.db
Database opened successfully
Database tables created/verified
Database initialized successfully
Server starting on http://localhost:8080
```

**If you see errors here, that's the problem!**

### 3. Common Issues

#### Issue: OpenSSL Not Found
**Error:** `find_package(OpenSSL REQUIRED)` fails

**Solution:**
- **Windows:** Install OpenSSL via vcpkg or download from https://slproweb.com/products/Win32OpenSSL.html
- **Linux:** `sudo apt install libssl-dev`
- **macOS:** `brew install openssl`

#### Issue: SQLite3 Not Found
**Error:** `SQLite3 library not found`

**Solution:**
- **Windows:** SQLite3 is usually bundled, but you may need to download from https://www.sqlite.org/download.html
- **Linux:** `sudo apt install libsqlite3-dev`
- **macOS:** `brew install sqlite3`

#### Issue: Database Permission Error
**Error:** `Can't open database` or filesystem errors

**Solution:**
- Make sure the executable has write permissions in the directory
- Check if antivirus is blocking file creation
- Try running as administrator (Windows)

#### Issue: Port Already in Use
**Error:** `Failed to start server`

**Solution:**
- Change port in `src/main.cpp` (line with `svr.listen("0.0.0.0", 8080)`)
- Or stop the process using port 8080

### 4. Test the Backend Directly

Test the health endpoint:
```powershell
curl http://localhost:8080/health
```

Or in browser: http://localhost:8080/health

You should see:
```json
{
  "status": "ok",
  "service": "LINCOLN API",
  "version": "0.1.0"
}
```

### 5. Check Backend Logs When Registering

When you try to register, watch the backend console. You should see:
```
Registering user: user@example.com
```

If you see an exception message, that's the actual error!

### 6. Test Registration with curl

```powershell
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Test1234\"}'
```

This will show you the exact error message from the backend.

### 7. Check Frontend Console

Open browser DevTools (F12) and check:
- **Console tab:** For JavaScript errors
- **Network tab:** For API request/response details

Look for the actual error message in the response.

## Still Having Issues?

1. Make sure backend is running (check console output)
2. Make sure frontend is running on port 3000
3. Check browser console for CORS or network errors
4. Check backend console for exception messages
5. Try the curl test above to isolate the issue

