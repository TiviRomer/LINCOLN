#include "database/database.h"
#include <sqlite3.h>
#include <iostream>
#include <filesystem>

namespace lincoln {
namespace database {

Database::Database() : db_(nullptr) {}

Database::~Database() {
    close();
}

bool Database::initialize(const std::string& dbPath) {
    try {
        std::filesystem::path path(dbPath);
        
        // Create parent directory if it doesn't exist
        if (!path.parent_path().empty()) {
            std::filesystem::create_directories(path.parent_path());
            std::cerr << "Database directory created/verified: " << path.parent_path().string() << std::endl;
        }
        
        std::cerr << "Opening database: " << dbPath << std::endl;
        int rc = sqlite3_open(dbPath.c_str(), &db_);
        if (rc != SQLITE_OK) {
            std::cerr << "Can't open database: " << sqlite3_errmsg(db_) << std::endl;
            if (db_) {
                sqlite3_close(db_);
                db_ = nullptr;
            }
            return false;
        }
        
        std::cerr << "Database opened successfully" << std::endl;
        executeQuery("PRAGMA foreign_keys = ON;");
        createTables();
        std::cerr << "Database tables created/verified" << std::endl;
        
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Exception in database initialization: " << e.what() << std::endl;
        return false;
    }
}

void Database::close() {
    if (db_) {
        sqlite3_close(db_);
        db_ = nullptr;
    }
}

void Database::createTables() {
    const char* createUsersTable = R"(
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    )";
    
    executeQuery(createUsersTable);
    
    const char* createEmailIndex = R"(
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    )";
    
    executeQuery(createEmailIndex);
}

bool Database::executeQuery(const std::string& query) {
    if (!db_) {
        return false;
    }
    
    char* errMsg = nullptr;
    int rc = sqlite3_exec(db_, query.c_str(), nullptr, nullptr, &errMsg);
    
    if (rc != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        return false;
    }
    
    return true;
}

bool Database::createUser(const std::string& name, const std::string& email, const std::string& passwordHash) {
    if (!db_) {
        return false;
    }
    
    const char* sql = R"(
        INSERT INTO users (name, email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    )";
    
    sqlite3_stmt* stmt;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db_) << std::endl;
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, name.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, email.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 3, passwordHash.c_str(), -1, SQLITE_STATIC);
    
    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    
    return rc == SQLITE_DONE;
}

std::optional<models::User> Database::getUserByEmail(const std::string& email) {
    if (!db_) {
        return std::nullopt;
    }
    
    const char* sql = R"(
        SELECT id, name, email, password_hash, 
               strftime('%s', created_at) as created_at,
               strftime('%s', updated_at) as updated_at
        FROM users
        WHERE email = ?;
    )";
    
    sqlite3_stmt* stmt;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return std::nullopt;
    }
    
    sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_STATIC);
    
    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW) {
        int id = sqlite3_column_int(stmt, 0);
        const char* name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        const char* email = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        const char* passwordHash = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        std::time_t createdAt = sqlite3_column_int64(stmt, 4);
        std::time_t updatedAt = sqlite3_column_int64(stmt, 5);
        
        models::User user(id, name, email, passwordHash, createdAt, updatedAt);
        sqlite3_finalize(stmt);
        return user;
    }
    
    sqlite3_finalize(stmt);
    return std::nullopt;
}

std::optional<models::User> Database::getUserById(int id) {
    if (!db_) {
        return std::nullopt;
    }
    
    const char* sql = R"(
        SELECT id, name, email, password_hash,
               strftime('%s', created_at) as created_at,
               strftime('%s', updated_at) as updated_at
        FROM users
        WHERE id = ?;
    )";
    
    sqlite3_stmt* stmt;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return std::nullopt;
    }
    
    sqlite3_bind_int(stmt, 1, id);
    
    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW) {
        int id = sqlite3_column_int(stmt, 0);
        const char* name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        const char* email = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        const char* passwordHash = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        std::time_t createdAt = sqlite3_column_int64(stmt, 4);
        std::time_t updatedAt = sqlite3_column_int64(stmt, 5);
        
        models::User user(id, name, email, passwordHash, createdAt, updatedAt);
        sqlite3_finalize(stmt);
        return user;
    }
    
    sqlite3_finalize(stmt);
    return std::nullopt;
}

bool Database::userExists(const std::string& email) {
    return getUserByEmail(email).has_value();
}

} // namespace database
} // namespace lincoln

