package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	// Use environment variables for configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")

	// Simulate an external database dependency (the service just logs the settings)
	log.Printf("Connecting to DB at %s:%s as user %s", dbHost, dbPort, dbUser)
	if dbHost == "" || dbPort == "" {
		log.Println("WARNING: Database configuration is incomplete.")
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s sslmode=disable", dbHost, dbPort, dbUser, dbPass)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("DB ping failed: %v", err)
	}
	log.Println("Successfully connected to the database.")

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Go Microservice running on port %s", port)
	})

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
