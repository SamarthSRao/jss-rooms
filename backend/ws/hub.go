package ws

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/jssrooms/backend/models"
)

var Upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
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
	Broadcast  chan models.Message
	Register   chan *Client
	Unregister chan *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]map[*Client]bool),
		Broadcast:  make(chan models.Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
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

// Global Hub instance to be used by controllers
var MainHub *Hub
