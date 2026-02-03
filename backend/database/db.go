package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/jssrooms/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system env")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Default for local development
		dsn = "host=localhost user=postgres password=Strawteddy12 dbname=jssrooms port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = db
	// Drop tables to fix schema mismatch (UUID vs String) and handle FKs
	db.Migrator().DropTable(&models.Message{}, &models.Room{}, &models.ActivityRegistration{})
	if err := db.AutoMigrate(&models.User{}, &models.Room{}, &models.Message{}, &models.Event{}, &models.Registration{}, &models.Activity{}, &models.ActivityRegistration{}); err != nil {
		log.Printf("Migration Failed: %v", err)
	}
	fmt.Println("Database migrated successfully")
}
