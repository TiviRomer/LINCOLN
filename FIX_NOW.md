# QUICK FIX - Follow These Steps

## Step 1: Rebuild Backend (REQUIRED)

Open PowerShell in `backend/c++` folder and run:

```powershell
.\build.ps1
```

Wait for it to finish. If it fails, tell me the error.

## Step 2: Start Backend Server

In the same PowerShell window:

```powershell
.\build\bin\Release\lincoln-api.exe
```

**IMPORTANT:** Keep this window open! You should see:
```
========================================
  LINCOLN API Server
  Version: 0.1.0
========================================
Initializing OpenSSL...
Initializing database at: data/lincoln.db
...
Server starting on http://localhost:8080
```

## Step 3: Start Frontend (New Terminal)

Open a NEW PowerShell window:

```powershell
cd frontend
npm run dev
```

## Step 4: Test

1. Open browser: http://localhost:3000
2. Try to register
3. **Check the backend console window** - it will show the exact error if something fails

## If Still Getting Error:

**Look at the backend console window** - it will show messages like:
- "Registering user: email@example.com"
- "Exception: [error message]"

**Copy that error message and tell me what it says.**

