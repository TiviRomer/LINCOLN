# Install C++ Compiler for Windows

CMake needs a C++ compiler to build the backend. You have two options:

## Option 1: Install Visual Studio Build Tools (Recommended)

1. Download Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. Run the installer
3. Select "Desktop development with C++" workload
4. Install
5. Restart PowerShell
6. Run `.\build.ps1` again

## Option 2: Install MinGW-w64

1. Download MSYS2: https://www.msys2.org/
2. Install MSYS2
3. Open MSYS2 terminal and run:
   ```
   pacman -Syu
   pacman -S mingw-w64-x86_64-gcc
   pacman -S mingw-w64-x86_64-cmake
   pacman -S mingw-w64-x86_64-make
   ```
4. Add `C:\msys64\mingw64\bin` to your PATH
5. Restart PowerShell
6. Run `.\build.ps1` again

## Quick Check

After installing, verify the compiler:
```powershell
# For Visual Studio
cl

# For MinGW
g++ --version
```

