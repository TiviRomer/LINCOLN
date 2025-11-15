#pragma once

#include "models/user.h"
#include "database/database.h"
#include <string>
#include <optional>

namespace lincoln {
namespace services {

struct AuthResult {
    bool success;
    std::string message;
    std::string token;
    models::User user;
    
    AuthResult() : success(false) {}
};

class AuthService {
public:
    AuthService(database::Database& db);
    
    AuthResult registerUser(const std::string& name, const std::string& email, const std::string& password);
    AuthResult loginUser(const std::string& email, const std::string& password);
    
    static bool isValidEmail(const std::string& email);
    static bool isValidPassword(const std::string& password, std::string& error);

private:
    database::Database& db_;
    std::string generateAuthToken(const models::User& user);
};

} // namespace services
} // namespace lincoln

