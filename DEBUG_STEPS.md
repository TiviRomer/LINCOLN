# Debugging "Internal Server Error"

## Step 1: Check Backend Console Output

**Most Important:** Look at the terminal/console where your backend server is running. You should see error messages there!

When you try to register, you should see messages like:
```
Registering user: user@example.com
```

If there's an error, you'll see:
```
Exception in register endpoint: [error message here]
```

## Step 2: Rebuild the Backend

Make sure you've rebuilt with the latest error handling:

```powershell
cd backend\c++
.\build.ps1
```

Then restart the server:
```powershell
a.\build\bin\Release\lincoln-api.exe
```

## Step 3: Check Common Issues

### Issue A: OpenSSL Not Working
**Symptoms:** Error about "Failed to generate random salt" or RAND_bytes failing

**Check:** Look for OpenSSL errors in console

**Solution:** The code now has fallbacks, but if it still fails:
- Make sure OpenSSL is installed
- On Windows: May need to add OpenSSL to PATH or use vcpkg

### Issue B: Database Error
**Symptoms:** "Can't open database" or filesystem errors

**Check:** Look for database initialization errors

**Solution:**
- Make sure the `data` directory can be created
- Check file permissions
- Try running as administrator

### Issue C: Missing Dependencies
**Symptoms:** Build fails or runtime errors about missing DLLs

**Solution:**
- Make sure all dependencies are installed
- On Windows: May need Visual C++ Redistributables

## Step 4: Test with curl

Test the backend directly (bypassing frontend):

```powershell
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Test1234\"}"
```

This will show you the exact error message from the backend.

## Step 5: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab - look for JavaScript errors
3. Go to **Network** tab - click on the failed request
4. Look at the **Response** - it should have the error message

## Step 6: Verify Backend is Running

Test the health endpoint:
```powershell
curl http://localhost:8080/health
```

Or open in browser: http://localhost:8080/health

Should return:
```json
{"status":"ok","service":"LINCOLN API","version":"0.1.0"}
```

## What to Share for Help

If you're still stuck, share:
1. **Backend console output** (the error messages)
2. **Browser console errors** (F12 → Console tab)
3. **Network response** (F12 → Network tab → click failed request → Response tab)
4. **What you were doing** when the error occurred (registering? logging in?)

