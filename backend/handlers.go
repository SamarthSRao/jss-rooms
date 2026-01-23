package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		USN  string `json:"usn"`
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	var existingUser User
	if err := DB.Where("usn = ?", input.USN).First(&existingUser).Error; err == nil {
		http.Error(w, "USN already registered. Please login.", http.StatusConflict)
		return
	}

	role := input.Role
	if role == "" {
		role = "user"
	}
	user := User{USN: input.USN, Role: role}
	if err := DB.Create(&user).Error; err != nil {
		http.Error(w, "Could not register user", http.StatusInternalServerError)
		return
	}

	generateTokenResponse(w, user)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		USN string `json:"usn"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	var user User
	result := DB.Where("usn = ?", input.USN).First(&user)
	if result.Error != nil {
		http.Error(w, "USN not found. Please register first.", http.StatusNotFound)
		return
	}

	generateTokenResponse(w, user)
}

func generateTokenResponse(w http.ResponseWriter, user User) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":   user.ID,
		"usn":  user.USN,
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(JWTSecret)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}

func getRoleFromToken(r *http.Request) string {
	tokenString := r.Header.Get("Authorization")
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return JWTSecret, nil
	})
	if token == nil {
		return ""
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return ""
	}
	return claims["role"].(string)
}

func handleRooms(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		var rooms []Room
		DB.Where("is_closed = ?", false).Order("created_at desc").Find(&rooms)
		json.NewEncoder(w).Encode(rooms)
		return
	}

	if r.Method == http.MethodPost {
		if getRoleFromToken(r) != "admin" {
			http.Error(w, "Forbidden: Only admins can create rooms", http.StatusForbidden)
			return
		}

		var input struct {
			Title        string `json:"title"`
			Description  string `json:"description"`
			TimerMinutes int    `json:"timer_minutes"`
			AdminID      string `json:"admin_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		adminID, _ := uuid.Parse(input.AdminID)
		room := Room{
			Title:        input.Title,
			Description:  input.Description,
			AdminID:      adminID,
			TimerMinutes: input.TimerMinutes,
			ExpiresAt:    time.Now().Add(time.Duration(input.TimerMinutes) * time.Minute),
		}
		DB.Create(&room)
		json.NewEncoder(w).Encode(room)
		return
	}
}

func handleCloseRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		RoomID string `json:"room_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	DB.Model(&Room{}).Where("id = ?", input.RoomID).Update("is_closed", true)
	w.WriteHeader(http.StatusNoContent)
}

func handleEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		var events []Event
		DB.Order("event_date asc").Find(&events)
		json.NewEncoder(w).Encode(events)
		return
	}

	// Admin can post events
	if r.Method == http.MethodPost {
		if getRoleFromToken(r) != "admin" {
			http.Error(w, "Forbidden: Only admins can post events", http.StatusForbidden)
			return
		}

		var event Event
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}
		DB.Create(&event)
		json.NewEncoder(w).Encode(event)
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("room")
	userUSN := r.URL.Query().Get("usn")
	userIDStr := r.URL.Query().Get("userId")
	userID, _ := uuid.Parse(userIDStr)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		ID:   userID.String(),
		Conn: conn,
		Send: make(chan []byte, 256),
		Room: roomID,
	}

	hub.Register <- client

	go func() {
		defer func() {
			hub.Unregister <- client
			conn.Close()
		}()
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				break
			}

			// Save to DB
			msg := Message{
				RoomID:  roomID,
				UserID:  userID,
				UserUSN: userUSN,
				Content: string(message),
			}
			DB.Create(&msg)

			hub.Broadcast <- msg
		}
	}()

	go func() {
		for message := range client.Send {
			client.Conn.WriteMessage(websocket.TextMessage, message)
		}
	}()
}

func getUserIDFromToken(r *http.Request) uuid.UUID {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		return uuid.Nil
	}
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return JWTSecret, nil
	})
	if token == nil {
		return uuid.Nil
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.Nil
	}
	idStr, ok := claims["id"].(string)
	if !ok {
		return uuid.Nil
	}
	id, _ := uuid.Parse(idStr)
	return id
}

func handleProfile(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromToken(r)
	if userID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if r.Method == http.MethodGet {
		var user User
		if err := DB.Preload("Group").Preload("ActivityRegistrations.Activity").First(&user, "id = ?", userID).Error; err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(user)
		return
	}

	if r.Method == http.MethodPut {
		var input struct {
			Name         string    `json:"name"`
			Bio          string    `json:"bio"`
			ProfileImage string    `json:"profile_image"`
			GroupID      uuid.UUID `json:"group_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		DB.Model(&User{}).Where("id = ?", userID).Updates(User{
			Name:         input.Name,
			Bio:          input.Bio,
			ProfileImage: input.ProfileImage,
			GroupID:      &input.GroupID,
		})
		w.WriteHeader(http.StatusNoContent)
		return
	}
}

func handleGroups(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		var groups []Group
		DB.Find(&groups)
		json.NewEncoder(w).Encode(groups)
		return
	}

	if r.Method == http.MethodPost {
		if getRoleFromToken(r) != "admin" {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		var group Group
		if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}
		DB.Create(&group)
		json.NewEncoder(w).Encode(group)
		return
	}
}

func handleEventRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserIDFromToken(r)
	if userID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		EventID uuid.UUID `json:"event_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Check if already registered
	var existing Registration
	if err := DB.Where("event_id = ? AND user_id = ?", input.EventID, userID).First(&existing).Error; err == nil {
		http.Error(w, "Already registered", http.StatusConflict)
		return
	}

	reg := Registration{
		EventID:     input.EventID,
		UserID:      userID,
		QRCodeToken: uuid.New().String(),
		Status:      "registered",
	}
	if err := DB.Create(&reg).Error; err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(reg)
}

func handleEventRegistrations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	role := getRoleFromToken(r)
	userID := getUserIDFromToken(r)

	eventID := r.URL.Query().Get("event_id")
	if eventID != "" {
		// Admin/Organizer view
		if role != "admin" {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		var regs []Registration
		DB.Where("event_id = ?", eventID).Find(&regs)
		json.NewEncoder(w).Encode(regs)
		return
	}

	// User view
	var regs []Registration
	DB.Where("user_id = ?", userID).Find(&regs)
	json.NewEncoder(w).Encode(regs)
}

func handleEventCheckIn(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if getRoleFromToken(r) != "admin" {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var input struct {
		QRCodeToken string `json:"qr_code_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	var reg Registration
	if err := DB.Where("qr_code_token = ?", input.QRCodeToken).First(&reg).Error; err != nil {
		http.Error(w, "Invalid token", http.StatusNotFound)
		return
	}

	if reg.Status == "checked_in" {
		http.Error(w, "Already checked in", http.StatusConflict)
		return
	}

	now := time.Now()
	DB.Model(&reg).Updates(Registration{
		Status:      "checked_in",
		CheckedInAt: &now,
	})

	json.NewEncoder(w).Encode(reg)
}

func handleActivities(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		var activities []Activity
		DB.Order("start_time asc").Find(&activities)
		json.NewEncoder(w).Encode(activities)
		return
	}

	if r.Method == http.MethodPost {
		if getRoleFromToken(r) != "admin" {
			http.Error(w, "Forbidden: Only admins can post activities", http.StatusForbidden)
			return
		}

		var activity Activity
		if err := json.NewDecoder(r.Body).Decode(&activity); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}
		DB.Create(&activity)
		json.NewEncoder(w).Encode(activity)
	}
}

func handleActivityRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserIDFromToken(r)
	if userID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		ActivityID uuid.UUID `json:"activity_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Double check user exists to get USN
	var user User
	if err := DB.First(&user, "id = ?", userID).Error; err != nil {
		http.Error(w, "User not found", http.StatusBadRequest)
		return
	}

	// Check if already registered
	var existing ActivityRegistration
	if err := DB.Where("activity_id = ? AND user_id = ?", input.ActivityID, userID).First(&existing).Error; err == nil {
		http.Error(w, "Already registered for this activity", http.StatusConflict)
		return
	}

	reg := ActivityRegistration{
		ActivityID: input.ActivityID,
		UserID:     userID,
		UserUSN:    user.USN,
		Status:     "registered",
	}
	if err := DB.Create(&reg).Error; err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(reg)
}
