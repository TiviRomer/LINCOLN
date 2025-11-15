#include "utils/crypto.h"
#include <openssl/sha.h>
#include <openssl/rand.h>
#include <sstream>
#include <iomanip>
#include <stdexcept>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <iostream>

namespace lincoln {
namespace crypto {

std::string bytesToHex(const unsigned char* bytes, size_t length) {
    std::stringstream ss;
    for (size_t i = 0; i < length; ++i) {
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(bytes[i]);
    }
    return ss.str();
}

std::string generateSalt(size_t length) {
    std::vector<unsigned char> saltBytes(length);
    
    // Try RAND_bytes first (cryptographically secure)
    int result = RAND_bytes(saltBytes.data(), static_cast<int>(length));
    
    // If RAND_bytes fails, try RAND_pseudo_bytes as fallback
    if (result != 1) {
        std::cerr << "Warning: RAND_bytes failed, trying RAND_pseudo_bytes..." << std::endl;
        result = RAND_pseudo_bytes(saltBytes.data(), static_cast<int>(length));
    }
    
    // If both fail, use a simple time-based fallback (less secure but functional)
    if (result != 1 && result != 2) {
        std::cerr << "Warning: OpenSSL RAND functions failed, using time-based fallback" << std::endl;
        std::srand(static_cast<unsigned int>(std::time(nullptr)));
        for (size_t i = 0; i < length; ++i) {
            saltBytes[i] = static_cast<unsigned char>(std::rand() % 256);
        }
    }
    
    return bytesToHex(saltBytes.data(), length);
}

std::string hashPassword(const std::string& password, const std::string& salt) {
    std::string actualSalt = salt.empty() ? generateSalt() : salt;
    
    std::string saltedPassword = password + actualSalt;
    
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, saltedPassword.c_str(), saltedPassword.length());
    SHA256_Final(hash, &sha256);
    
    std::string hashHex = bytesToHex(hash, SHA256_DIGEST_LENGTH);
    
    return actualSalt + ":" + hashHex;
}

bool verifyPassword(const std::string& password, const std::string& hash) {
    size_t colonPos = hash.find(':');
    if (colonPos == std::string::npos) {
        return false;
    }
    
    std::string salt = hash.substr(0, colonPos);
    std::string expectedHash = hash.substr(colonPos + 1);
    
    std::string computedHash = hashPassword(password, salt);
    
    size_t computedColonPos = computedHash.find(':');
    if (computedColonPos == std::string::npos) {
        return false;
    }
    
    std::string computedHashPart = computedHash.substr(computedColonPos + 1);
    
    return computedHashPart == expectedHash;
}

std::string generateToken(size_t length) {
    return generateSalt(length);
}

} // namespace crypto
} // namespace lincoln

