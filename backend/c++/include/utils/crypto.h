#pragma once

#include <string>

namespace lincoln {
namespace crypto {

std::string hashPassword(const std::string& password, const std::string& salt = "");
bool verifyPassword(const std::string& password, const std::string& hash);
std::string generateSalt(size_t length = 16);
std::string generateToken(size_t length = 32);

} // namespace crypto
} // namespace lincoln

