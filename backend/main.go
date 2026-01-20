package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	DB        *gorm.DB
	JWTSecret = []byte("your-secret-key") // In production, use environment variable
	upgrader  = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func initDB() {
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

	db.AutoMigrate(&User{}, &Room{}, &Message{}, &Event{})
	DB = db
	fmt.Println("Database migrated successfully")
}

// WebSocket Hub
type Client struct {
	ID   string
	Conn *websocket.Conn
	Send chan []byte
	Room string
}

type Hub struct {
	Rooms      map[string]map[*Client]bool
	Broadcast  chan Message
	Register   chan *Client
	Unregister chan *Client
	mu         sync.Mutex
}

func newHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]map[*Client]bool),
		Broadcast:  make(chan Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.Rooms[client.Room] == nil {
				h.Rooms[client.Room] = make(map[*Client]bool)
			}
			h.Rooms[client.Room][client] = true
			h.mu.Unlock()
		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Rooms[client.Room][client]; ok {
				delete(h.Rooms[client.Room], client)
				close(client.Send)
			}
			h.mu.Unlock()
		case msg := <-h.Broadcast:
			h.mu.Lock()
			roomID := msg.RoomID
			for client := range h.Rooms[roomID] {
				msgBytes, _ := json.Marshal(msg)
				select {
				case client.Send <- msgBytes:
				default:
					close(client.Send)
					delete(h.Rooms[roomID], client)
				}
			}
			h.mu.Unlock()
		}
	}
}

var hub *Hub

func main() {
	initDB()
	hub = newHub()
	go hub.run()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", handleLogin)
	mux.HandleFunc("/api/register", handleRegister)
	mux.HandleFunc("/api/rooms", authMiddleware(handleRooms))
	mux.HandleFunc("/api/rooms/close", adminMiddleware(handleCloseRoom))
	mux.HandleFunc("/api/events", handleEvents) // We'll handle role check inside here for GET/POST mix
	mux.HandleFunc("/api/events/register", authMiddleware(handleEventRegister))
	mux.HandleFunc("/api/events/registrations", authMiddleware(handleEventRegistrations))
	mux.HandleFunc("/api/events/checkin", adminMiddleware(handleEventCheckIn))
	mux.HandleFunc("/api/profile", authMiddleware(handleProfile))
	mux.HandleFunc("/api/groups", authMiddleware(handleGroups))
	mux.HandleFunc("/ws", handleWebSocket)

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

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return JWTSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
}

func adminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return JWTSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["role"] != "admin" {
			http.Error(w, "Forbidden: Admin access only", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	}
}
