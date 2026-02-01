package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jssrooms/backend/database"
	"github.com/jssrooms/backend/models"
	"github.com/jssrooms/backend/routes"
	"github.com/jssrooms/backend/ws"
)

func main() {
	database.InitDB()

	// Start background tasks
	go startRoomCleanupTicker()

	// Initialize WebSocket Hub
	ws.MainHub = ws.NewHub()
	go ws.MainHub.Run()

	// Setup Routes
	mux := http.NewServeMux()
	routes.SetupRoutes(mux)

	// Simple CORS wrapper
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			return
		}

		mux.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func startRoomCleanupTicker() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		result := database.DB.Model(&models.Room{}).Where("is_closed = ? AND expires_at < ?", false, time.Now()).Update("is_closed", true)
		if result.Error != nil {
			log.Printf("Error closing expired rooms: %v", result.Error)
		} else if result.RowsAffected > 0 {
			log.Printf("Closed %d expired rooms", result.RowsAffected)
		}
	}
}
