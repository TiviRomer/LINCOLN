cmake_minimum_required(VERSION 3.15)
project(LINCOLN_Backend VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/include)

# Find packages
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

# SQLite3
find_library(SQLITE3_LIB sqlite3)
if(NOT SQLITE3_LIB)
    message(FATAL_ERROR "SQLite3 library not found. Please install libsqlite3-dev (Linux) or sqlite3 (Windows)")
endif()

# Download cpp-httplib (header-only)
include(FetchContent)
FetchContent_Declare(
    httplib
    GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
    GIT_TAG v0.14.3
)
FetchContent_MakeAvailable(httplib)

# Download nlohmann/json (header-only)
FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.3
)
FetchContent_MakeAvailable(json)

# Source files
set(SOURCES
    src/main.cpp
    src/database/database.cpp
    src/services/auth_service.cpp
    src/utils/crypto.cpp
)

set(HEADERS
    include/database/database.h
    include/models/user.h
    include/services/auth_service.h
    include/utils/crypto.h
)

# Create executable
add_executable(lincoln-api ${SOURCES} ${HEADERS})

# Link libraries
target_link_libraries(lincoln-api 
    ${SQLITE3_LIB}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
)

# Include directories for target
target_include_directories(lincoln-api PRIVATE
    ${CMAKE_SOURCE_DIR}/include
)

# Compiler options
if(MSVC)
    target_compile_options(lincoln-api PRIVATE /W4)
else()
    target_compile_options(lincoln-api PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Create data directory for database
file(MAKE_DIRECTORY ${CMAKE_BINARY_DIR}/data)

