package main

import (
	"log"
	"net/http"

	"auth-service/internal/config"
	"auth-service/internal/database"
	"auth-service/internal/routes"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to the database
	database.Connect(cfg.DatabaseURL())
	defer database.Close()

	// Set up routes
	router := routes.SetupRoutes(cfg.JWTSecret, cfg)

	// Start the HTTP server
	log.Printf("Starting server on %s", cfg.ServerAddress)
	if err := http.ListenAndServe(cfg.ServerAddress, router); err != nil {
		log.Fatalf("could not start server: %v", err)
	}
}
