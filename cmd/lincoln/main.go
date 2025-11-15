package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/viper"
)

var (
	configFile string
	mode      string
)

func init() {
	flag.StringVar(&configFile, "config", "configs/config.toml", "path to config file")
	flag.StringVar(&mode, "mode", "server", "operation mode: 'server' or 'agent'")
}

func main() {
	flag.Parse()

	// Cargar configuración
	config, err := loadConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	// Configurar logger
	logger, err := setupLogger(config)
	if err != nil {
		log.Fatalf("Error setting up logger: %v", err)
	}

	// Crear contexto con manejo de señales
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	setupSignalHandlers(cancel, logger)

	switch mode {
	case "server":
		err = runServer(ctx, config, logger)
	case "agent":
		err = runAgent(ctx, config, logger)
	default:
		logger.Fatalf("Invalid mode: %s. Use 'server' or 'agent'", mode)
	}

	if err != nil {
		logger.Fatalf("Error in %s: %v", mode, err)
	}
}

func loadConfig() (*viper.Viper, error) {
	v := viper.New()
	v.SetConfigFile(configFile)

	// Cargar valores por defecto
	setDefaultConfig(v)

	// Leer archivo de configuración
	err := v.ReadInConfig()
	if err != nil {
		return nil, fmt.Errorf("error reading config file: %w", err)
	}

	// Leer variables de entorno
	v.AutomaticEnv()

	return v, nil
}

func setDefaultConfig(v *viper.Viper) {
	// Configuración por defecto del servidor
	v.SetDefault("server.host", "0.0.0.0")
	v.SetDefault("server.port", 8080)
	v.SetDefault("server.environment", "development")
	v.SetDefault("server.log_level", "info")

	// Configuración por defecto de la base de datos
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "postgres")
	v.SetDefault("database.dbname", "lincoln")
	v.SetDefault("database.sslmode", "disable")
	v.SetDefault("database.max_open_conns", 25)
	v.SetDefault("database.max_idle_conns", 5)
	v.SetDefault("database.conn_max_lifetime", "5m")
}

func setupLogger(config *viper.Viper) (*log.Logger, error) {
	// En una implementación real, configuraría un logger más sofisticado
	// como logrus o zap basado en la configuración
	return log.New(os.Stdout, "LINCOLN: ", log.LstdFlags|log.Lshortfile), nil
}

func setupSignalHandlers(cancel context.CancelFunc, logger *log.Logger) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		logger.Printf("Received signal: %v. Shutting down...\n", sig)
		cancel()
	}()
}

func runServer(ctx context.Context, config *viper.Viper, logger *log.Logger) error {
	logger.Println("Starting LINCOLN server...")
	// Implementar lógica del servidor aquí
	<-ctx.Done()
	logger.Println("Shutting down server...")
	return nil
}

func runAgent(ctx context.Context, config *viper.Viper, logger *log.Logger) error {
	logger.Println("Starting LINCOLN agent...")
	// Implementar lógica del agente aquí
	<-ctx.Done()
	logger.Println("Shutting down agent...")
	return nil
}
