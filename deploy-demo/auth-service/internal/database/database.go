package database

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func Connect(connStr string) *gorm.DB {
	var err error
	db, err = gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get the underlying sql.DB: %v", err)
	}

	if err = sqlDB.Ping(); err != nil {
		log.Fatalf("Failed to ping the database: %v", err)
	}

	log.Println("Database connection established")
	return db
}

func GetDB() *gorm.DB {
	return db
}

func Close() {
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get the underlying sql.DB: %v", err)
	}
	if err := sqlDB.Close(); err != nil {
		log.Fatalf("Failed to close the database connection: %v", err)
	}
}
