# START EVERYTHING - Step by Step

## The Problem
The backend server is NOT running. That's why you're getting 500 errors.

## Solution - Follow These Steps:

### Step 1: Build the Backend (One Time)

Open PowerShell and run:
```powershell
cd backend\c++
.\build.ps1
```

Wait for it to finish. If it fails, you need to install dependencies (CMake, OpenSSL, etc.)

### Step 2: Start Backend Server

**Keep this PowerShell window open!**

```powershell
.\build\bin\Release\lincoln-api.exe
```

You should see:
```
========================================
  LINCOLN API Server
  Version: 0.1.0
========================================
Initializing OpenSSL...
Initializing database at: data/lincoln.db
Database opened successfully
Server starting on http://localhost:8080
```

**If you see errors here, that's the problem!**

### Step 3: Start Frontend (New Terminal)

Open a **NEW** PowerShell window:

```powershell
cd frontend
npm run dev
```

### Step 4: Test

1. Open browser: http://localhost:3000
2. Try to register/login
3. **Watch the backend console** - it will show what's happening

## Quick Start Script

I created `START_BACKEND.ps1` - you can use it:

```powershell
.\START_BACKEND.ps1
```

## Still Getting 500 Error?

1. **Check backend console** - Look for error messages
2. **Test backend directly**: Open http://localhost:8080/health in browser
3. **Check if port 8080 is in use**: Maybe another program is using it

## Common Issues

- **Backend won't start**: Check console for errors (OpenSSL, database, etc.)
- **Port 8080 in use**: Change port in `backend/c++/src/main.cpp`
- **Build fails**: Install CMake, OpenSSL, SQLite3

