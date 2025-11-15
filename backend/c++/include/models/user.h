#pragma once

#include <string>
#include <ctime>

namespace lincoln {
namespace models {

struct User {
    int id;
    std::string name;
    std::string email;
    std::string passwordHash;
    std::time_t createdAt;
    std::time_t updatedAt;
    
    User() : id(0), createdAt(0), updatedAt(0) {}
    
    User(int id, const std::string& name, const std::string& email, 
         const std::string& passwordHash, std::time_t createdAt, std::time_t updatedAt)
        : id(id), name(name), email(email), passwordHash(passwordHash),
          createdAt(createdAt), updatedAt(updatedAt) {}
};

} // namespace models
} // namespace lincoln

