#include <iostream>
#include <string>
#include <cstdlib>
#include <csignal>
#include <openssl/rand.h>
#include <openssl/err.h>
#include "httplib.h"
#include "json.hpp"
#include "database/database.h"
#include "services/auth_service.h"

using json = nlohmann::json;
using namespace lincoln;
using namespace lincoln::services;

database::Database* g_db = nullptr;

void signalHandler(int signal) {
    std::cout << "\nReceived signal " << signal << ". Shutting down gracefully..." << std::endl;
    if (g_db) {
        g_db->close();
    }
    exit(0);
}

void setCORSHeaders(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set_header("Access-Control-Max-Age", "3600");
}

void handleOptions(httplib::Response& res) {
    setCORSHeaders(res);
    res.status = 200;
}

int main() {
    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);
    
    // Initialize OpenSSL random number generator
    std::cerr << "Initializing OpenSSL..." << std::endl;
    if (RAND_poll() == 0) {
        std::cerr << "Warning: RAND_poll() failed, but continuing..." << std::endl;
    }
    
    // Determine database path relative to executable
    std::string dbPath = "data/lincoln.db";
    
    database::Database db;
    std::cerr << "Initializing database at: " << dbPath << std::endl;
    if (!db.initialize(dbPath)) {
        std::cerr << "Failed to initialize database" << std::endl;
        return 1;
    }
    std::cerr << "Database initialized successfully" << std::endl;
    g_db = &db;
    
    services::AuthService authService(db);
    
    httplib::Server svr;
    
    // Health check
    svr.Get("/health", [](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);
        json response = {
            {"status", "ok"},
            {"service", "LINCOLN API"},
            {"version", "0.1.0"}
        };
        res.set_content(response.dump(), "application/json");
    });
    
    // Register endpoint
    svr.Post("/api/auth/register", [&authService](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);
        
        try {
            json body;
            try {
                body = json::parse(req.body);
            } catch (const json::exception& e) {
                std::cerr << "JSON parse error: " << e.what() << std::endl;
                json response = {
                    {"success", false},
                    {"message", "Invalid JSON format: " + std::string(e.what())}
                };
                res.status = 400;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            std::string name = body.value("name", "");
            std::string email = body.value("email", "");
            std::string password = body.value("password", "");
            
            if (name.empty() || email.empty() || password.empty()) {
                json response = {
                    {"success", false},
                    {"message", "Name, email, and password are required"}
                };
                res.status = 400;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            std::cerr << "Registering user: " << email << std::endl;
            
            services::AuthResult result;
            try {
                result = authService.registerUser(name, email, password);
            } catch (const std::exception& e) {
                std::cerr << "Exception in authService.registerUser: " << e.what() << std::endl;
                json response = {
                    {"success", false},
                    {"message", "Registration failed: " + std::string(e.what())}
                };
                res.status = 500;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            if (result.success) {
                json response = {
                    {"success", true},
                    {"message", result.message},
                    {"token", result.token},
                    {"user", {
                        {"id", result.user.id},
                        {"name", result.user.name},
                        {"email", result.user.email}
                    }}
                };
                res.status = 201;
                res.set_content(response.dump(), "application/json");
            } else {
                std::cerr << "Registration failed: " << result.message << std::endl;
                json response = {
                    {"success", false},
                    {"message", result.message}
                };
                res.status = 400;
                res.set_content(response.dump(), "application/json");
            }
        } catch (const std::exception& e) {
            std::cerr << "Exception in register endpoint: " << e.what() << std::endl;
            json response = {
                {"success", false},
                {"message", "Internal server error: " + std::string(e.what())}
            };
            res.status = 500;
            res.set_content(response.dump(), "application/json");
        } catch (...) {
            std::cerr << "Unknown exception in register endpoint" << std::endl;
            json response = {
                {"success", false},
                {"message", "Internal server error: Unknown exception"}
            };
            res.status = 500;
            res.set_content(response.dump(), "application/json");
        }
    });
    
    // Login endpoint
    svr.Post("/api/auth/login", [&authService](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);
        
        try {
            json body;
            try {
                body = json::parse(req.body);
            } catch (const json::exception& e) {
                std::cerr << "JSON parse error: " << e.what() << std::endl;
                json response = {
                    {"success", false},
                    {"message", "Invalid JSON format: " + std::string(e.what())}
                };
                res.status = 400;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            std::string email = body.value("email", "");
            std::string password = body.value("password", "");
            
            if (email.empty() || password.empty()) {
                json response = {
                    {"success", false},
                    {"message", "Email and password are required"}
                };
                res.status = 400;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            std::cerr << "Login attempt for: " << email << std::endl;
            auto result = authService.loginUser(email, password);
            
            if (result.success) {
                json response = {
                    {"success", true},
                    {"message", result.message},
                    {"token", result.token},
                    {"user", {
                        {"id", result.user.id},
                        {"name", result.user.name},
                        {"email", result.user.email}
                    }}
                };
                res.status = 200;
                res.set_content(response.dump(), "application/json");
            } else {
                std::cerr << "Login failed: " << result.message << std::endl;
                json response = {
                    {"success", false},
                    {"message", result.message}
                };
                res.status = 401;
                res.set_content(response.dump(), "application/json");
            }
        } catch (const std::exception& e) {
            std::cerr << "Exception in login endpoint: " << e.what() << std::endl;
            json response = {
                {"success", false},
                {"message", "Internal server error: " + std::string(e.what())}
            };
            res.status = 500;
            res.set_content(response.dump(), "application/json");
        } catch (...) {
            std::cerr << "Unknown exception in login endpoint" << std::endl;
            json response = {
                {"success", false},
                {"message", "Internal server error: Unknown exception"}
            };
            res.status = 500;
            res.set_content(response.dump(), "application/json");
        }
    });
    
    // Handle OPTIONS for CORS preflight
    svr.Options(".*", [](const httplib::Request& req, httplib::Response& res) {
        handleOptions(res);
    });
    
    std::cout << "========================================" << std::endl;
    std::cout << "  LINCOLN API Server" << std::endl;
    std::cout << "  Version: 0.1.0" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Server starting on http://localhost:8080" << std::endl;
    std::cout << "Health check: http://localhost:8080/health" << std::endl;
    std::cout << "Press Ctrl+C to stop the server" << std::endl;
    std::cout << "========================================" << std::endl;
    
    if (!svr.listen("0.0.0.0", 8080)) {
        std::cerr << "Failed to start server" << std::endl;
        return 1;
    }
    
    return 0;
}

