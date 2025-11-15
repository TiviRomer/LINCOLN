#include "services/auth_service.h"
#include "utils/crypto.h"
#include <regex>
#include <sstream>

namespace lincoln {
namespace services {

AuthService::AuthService(database::Database& db) : db_(db) {}

bool AuthService::isValidEmail(const std::string& email) {
    const std::regex pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    return std::regex_match(email, pattern);
}

bool AuthService::isValidPassword(const std::string& password, std::string& error) {
    if (password.length() < 8) {
        error = "Password must be at least 8 characters long";
        return false;
    }
    
    bool hasUpper = false;
    bool hasLower = false;
    bool hasDigit = false;
    
    for (char c : password) {
        if (std::isupper(c)) hasUpper = true;
        if (std::islower(c)) hasLower = true;
        if (std::isdigit(c)) hasDigit = true;
    }
    
    if (!hasUpper) {
        error = "Password must contain at least one uppercase letter";
        return false;
    }
    
    if (!hasLower) {
        error = "Password must contain at least one lowercase letter";
        return false;
    }
    
    if (!hasDigit) {
        error = "Password must contain at least one number";
        return false;
    }
    
    return true;
}

std::string AuthService::generateAuthToken(const models::User& user) {
    std::stringstream ss;
    ss << user.id << ":" << user.email << ":" << crypto::generateToken(16);
    return ss.str();
}

AuthResult AuthService::registerUser(const std::string& name, const std::string& email, const std::string& password) {
    AuthResult result;
    
    if (name.empty() || name.length() < 2) {
        result.message = "Name must be at least 2 characters long";
        return result;
    }
    
    if (!isValidEmail(email)) {
        result.message = "Invalid email format";
        return result;
    }
    
    std::string passwordError;
    if (!isValidPassword(password, passwordError)) {
        result.message = passwordError;
        return result;
    }
    
    if (db_.userExists(email)) {
        result.message = "User with this email already exists";
        return result;
    }
    
    std::string passwordHash;
    try {
        passwordHash = crypto::hashPassword(password);
    } catch (const std::exception& e) {
        result.message = "Failed to hash password: " + std::string(e.what());
        return result;
    }
    
    if (!db_.createUser(name, email, passwordHash)) {
        result.message = "Failed to create user account";
        return result;
    }
    
    auto user = db_.getUserByEmail(email);
    if (!user.has_value()) {
        result.message = "Failed to retrieve created user";
        return result;
    }
    
    result.success = true;
    result.message = "User registered successfully";
    result.token = generateAuthToken(user.value());
    result.user = user.value();
    
    return result;
}

AuthResult AuthService::loginUser(const std::string& email, const std::string& password) {
    AuthResult result;
    
    if (!isValidEmail(email)) {
        result.message = "Invalid email format";
        return result;
    }
    
    auto user = db_.getUserByEmail(email);
    if (!user.has_value()) {
        result.message = "Invalid email or password";
        return result;
    }
    
    if (!crypto::verifyPassword(password, user->passwordHash)) {
        result.message = "Invalid email or password";
        return result;
    }
    
    result.success = true;
    result.message = "Login successful";
    result.token = generateAuthToken(user.value());
    result.user = user.value();
    
    return result;
}

} // namespace services
} // namespace lincoln

