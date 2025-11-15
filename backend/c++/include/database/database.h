#pragma once

#include "../models/user.h"
#include <string>
#include <optional>

struct sqlite3;

namespace lincoln {
namespace database {

class Database {
public:
    Database();
    ~Database();
    
    bool initialize(const std::string& dbPath = "data/lincoln.db");
    void close();
    
    bool createUser(const std::string& name, const std::string& email, const std::string& passwordHash);
    std::optional<models::User> getUserByEmail(const std::string& email);
    std::optional<models::User> getUserById(int id);
    bool userExists(const std::string& email);
    
    bool isOpen() const { return db_ != nullptr; }

private:
    sqlite3* db_;
    
    bool executeQuery(const std::string& query);
    void createTables();
};

} // namespace database
} // namespace lincoln

