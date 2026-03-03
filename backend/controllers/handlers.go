package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/jssrooms/backend/database"
	"github.com/jssrooms/backend/helpers"
	"github.com/jssrooms/backend/models"
	"github.com/jssrooms/backend/ws"
	"gorm.io/gorm"
)

func getTokenFromRequest(r *http.Request) string {
	token := r.Header.Get("Authorization")
	return strings.TrimPrefix(token, "Bearer ")
}

func HandleRooms(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		log.Println("GET /api/rooms called")
		var rooms []models.Room
		database.DB.Where("is_closed = ? AND expires_at > ?", false, time.Now()).Order("created_at desc").Find(&rooms)
		log.Printf("Found %d rooms", len(rooms))
		json.NewEncoder(w).Encode(rooms)
		return
	}

	if r.Method == http.MethodPost {
		token := getTokenFromRequest(r)
		if helpers.GetRoleFromToken(token) != "admin" {
			http.Error(w, "Forbidden: Only admins can create rooms", http.StatusForbidden)
			return
		}

		var input struct {
			Title        string `json:"title"`
			Description  string `json:"description"`
			TimerMinutes int    `json:"timer_minutes"`
			AdminID      string `json:"admin_id"`
			GroupID      string `json:"group_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		adminID, _ := uuid.Parse(input.AdminID)
		var groupIDPtr *uuid.UUID
		if input.GroupID != "" {
			gid, err := uuid.Parse(input.GroupID)
			if err == nil {
				groupIDPtr = &gid
			}
		}

		room := models.Room{
			Title:        input.Title,
			Description:  input.Description,
			AdminID:      adminID,
			TimerMinutes: input.TimerMinutes,
			ExpiresAt:    time.Now().Add(time.Duration(input.TimerMinutes) * time.Minute),
			GroupID:      groupIDPtr,
		}
		database.DB.Create(&room)
		json.NewEncoder(w).Encode(room)
		return
	}
}

func HandleCloseRoom(w http.ResponseWriter, r *http.Request) {
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

	database.DB.Model(&models.Room{}).Where("id = ?", input.RoomID).Update("is_closed", true)
	w.WriteHeader(http.StatusNoContent)
}

func HandleEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		var events []models.Event
		database.DB.Order("event_date asc").Find(&events)
		json.NewEncoder(w).Encode(events)
		return
	}

	// Admin can post events
	if r.Method == http.MethodPost {
		token := getTokenFromRequest(r)
		if helpers.GetRoleFromToken(token) != "admin" {
			http.Error(w, "Forbidden: Only admins can post events", http.StatusForbidden)
			return
		}

		var event models.Event
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Validation
		phoneRegex := regexp.MustCompile(`^(\+91[\-\s]?)?[0-9]{10}$`)
		if event.ContactNumber != "" && !phoneRegex.MatchString(event.ContactNumber) {
			http.Error(w, "Invalid contact number format", http.StatusBadRequest)
			return
		}
		if event.Capacity <= 0 {
			http.Error(w, "Capacity must be a positive integer", http.StatusBadRequest)
			return
		}

		database.DB.Create(&event)
		json.NewEncoder(w).Encode(event)
		return
	}

	// Admin can delete events
	if r.Method == http.MethodDelete {
		token := getTokenFromRequest(r)
		if helpers.GetRoleFromToken(token) != "admin" {
			http.Error(w, "Forbidden: Only admins can delete events", http.StatusForbidden)
			return
		}

		eventID := r.URL.Query().Get("id")
		if eventID == "" {
			http.Error(w, "Event ID required", http.StatusBadRequest)
			return
		}

		if err := database.DB.Delete(&models.Event{}, "id = ?", eventID).Error; err != nil {
			http.Error(w, "Failed to delete event", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("room")
	userUSN := r.URL.Query().Get("usn")
	// If name is passed in query, use it, otherwise we'll fetch it
	userName := r.URL.Query().Get("name")
	userIDStr := r.URL.Query().Get("userId")
	userID, _ := uuid.Parse(userIDStr)

	// Validate room existence and expiration
	var room models.Room
	if err := database.DB.First(&room, "id = ?", roomID).Error; err != nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}
	if room.IsClosed {
		http.Error(w, "Room is closed", http.StatusGone) // 410 Gone
		return
	}
	if time.Now().After(room.ExpiresAt) {
		http.Error(w, "Room has expired", http.StatusGone)
		return
	}

	// Check group restriction
	if room.GroupID != nil {
		var user models.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}
		if user.GroupID == nil || *user.GroupID != *room.GroupID {
			// Optional: Allow admin formatted override if needed, but strict for now
			http.Error(w, "Access Denied: Room restricted to group members", http.StatusForbidden)
			return
		}
	}

	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &ws.Client{
		ID:   userID.String(),
		Conn: conn,
		Send: make(chan []byte, 256),
		Room: roomID,
	}

	// Fetch recent history
	var history []models.Message
	database.DB.Where("room_id = ?", roomID).Order("created_at asc").Limit(100).Find(&history)
	for _, msg := range history {
		msgBytes, _ := json.Marshal(msg)
		client.Conn.WriteMessage(websocket.TextMessage, msgBytes)
	}

	ws.MainHub.Register <- client

	go func() {
		defer func() {
			ws.MainHub.Unregister <- client
			conn.Close()
		}()
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				break
			}

			// Save to DB
			msg := models.Message{
				RoomID:   roomID,
				UserID:   userID,
				UserUSN:  userUSN,
				UserName: userName, // Populate name
				Content:  string(message),
			}
			database.DB.Create(&msg)

			ws.MainHub.Broadcast <- msg
		}
	}()

	go func() {
		for message := range client.Send {
			client.Conn.WriteMessage(websocket.TextMessage, message)
		}
	}()
}

func HandleGroups(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		var groups []models.Group
		database.DB.Find(&groups)
		json.NewEncoder(w).Encode(groups)
		return
	}

	if r.Method == http.MethodPost {
		token := getTokenFromRequest(r)
		if helpers.GetRoleFromToken(token) != "admin" {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		var group models.Group
		if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}
		database.DB.Create(&group)
		json.NewEncoder(w).Encode(group)
		return
	}
}

func HandleEventRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := getTokenFromRequest(r)
	userID := helpers.GetUserIDFromToken(token)
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
	var existing models.Registration
	if err := database.DB.Where("event_id = ? AND user_id = ?", input.EventID, userID).First(&existing).Error; err == nil {
		http.Error(w, "Already registered", http.StatusConflict)
		return
	}

	reg := models.Registration{
		EventID:     input.EventID,
		UserID:      userID,
		QRCodeToken: uuid.New().String(),
		Status:      "registered",
	}
	if err := database.DB.Create(&reg).Error; err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(reg)
}

func HandleEventRegistrations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := getTokenFromRequest(r)
	role := helpers.GetRoleFromToken(token)
	userID := helpers.GetUserIDFromToken(token)

	eventID := r.URL.Query().Get("event_id")
	if eventID != "" {
		// Admin/Organizer view
		if role != "admin" {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		var regs []models.Registration
		database.DB.Where("event_id = ?", eventID).Find(&regs)
		json.NewEncoder(w).Encode(regs)
		return
	}

	// User view
	var regs []models.Registration
	database.DB.Where("user_id = ?", userID).Find(&regs)
	json.NewEncoder(w).Encode(regs)
}

func HandleActivityRegistrations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := getTokenFromRequest(r)
	role := helpers.GetRoleFromToken(token)

	// Admin view only for now
	if role != "admin" {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	activityID := r.URL.Query().Get("activity_id")
	if activityID == "" {
		http.Error(w, "Activity ID required", http.StatusBadRequest)
		return
	}

	var regs []models.ActivityRegistration
	// Preload User to show details (Name, College, Year) in admin activity log
	if err := database.DB.Preload("User").Where("activity_id = ?", activityID).Find(&regs).Error; err != nil {
		http.Error(w, "Failed to fetch registrations", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(regs)
}

func HandleEventCheckIn(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := getTokenFromRequest(r)
	if helpers.GetRoleFromToken(token) != "admin" {
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

	// 1. Try finding in Event Registrations (Legacy/Standard Events)
	var reg models.Registration
	if err := database.DB.Preload("User").Preload("Event").Where("qr_code_token = ?", input.QRCodeToken).First(&reg).Error; err == nil {
		if reg.Status == "checked_in" {
			http.Error(w, "Already checked in", http.StatusConflict)
			return
		}

		now := time.Now()
		database.DB.Model(&reg).Updates(models.Registration{
			Status:      "checked_in",
			CheckedInAt: &now,
		})

		json.NewEncoder(w).Encode(reg)
		return
	}

	// 2. Try finding in Activity Registrations (New Activity Flow)
	var actReg models.ActivityRegistration
	if err := database.DB.Preload("Activity").Where("id = ?", input.QRCodeToken).First(&actReg).Error; err == nil {
		if actReg.Status == "checked_in" {
			http.Error(w, "Already checked in", http.StatusConflict)
			return
		}

		// Update status
		database.DB.Model(&actReg).Update("status", "checked_in")

		// Fetch user details
		var user models.User
		database.DB.First(&user, "id = ?", actReg.UserID)

		response := map[string]interface{}{
			"id":     actReg.ID,
			"status": "checked_in",
			"user":   user,
			"event": map[string]interface{}{
				"title": actReg.Activity.Title,
			},
		}

		json.NewEncoder(w).Encode(response)
		return
	}

	http.Error(w, "Invalid token", http.StatusNotFound)
}

func HandleActivities(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		var activities []models.Activity
		database.DB.Order("start_time asc").Find(&activities)
		json.NewEncoder(w).Encode(activities)
		return
	}

	if r.Method == http.MethodPost {
		token := getTokenFromRequest(r)
		if helpers.GetRoleFromToken(token) != "admin" {
			http.Error(w, "Forbidden: Only admins can post activities", http.StatusForbidden)
			return
		}

		var activity models.Activity
		if err := json.NewDecoder(r.Body).Decode(&activity); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Validation
		phoneRegex := regexp.MustCompile(`^(\+91[\-\s]?)?[0-9]{10}$`)
		if activity.ContactNumber != "" && !phoneRegex.MatchString(activity.ContactNumber) {
			http.Error(w, "Invalid contact number format", http.StatusBadRequest)
			return
		}

		database.DB.Create(&activity)
		json.NewEncoder(w).Encode(activity)
	}
}

func HandleActivityRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := getTokenFromRequest(r)
	userID := helpers.GetUserIDFromToken(token)
	if userID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		ActivityID uuid.UUID `json:"activity_id"`
		USNs       []string  `json:"usns"` // Optional: register others by USN
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Double check requesting user exists
	var currentUser models.User
	if err := database.DB.First(&currentUser, "id = ?", userID).Error; err != nil {
		http.Error(w, "User not found", http.StatusBadRequest)
		return
	}

	// Prepare list of USNs to register
	// Always include the current user unless they explicitly excluded themselves (which isn't really supported by UI yet, so let's default to including them if USNs is empty, or if they are in the list)
	// Actually, easier logic:
	// If input.USNs is empty, just register current user.
	// If input.USNs has values, register ALL of them.
	// BUT, user might want to add friends + themselves.
	// Let's assume the frontend sends the complete list of USNs to register.
	// If frontend sends empty USNs list, we fallback to just the current user.

	targetUSNs := input.USNs
	if len(targetUSNs) == 0 {
		usnStr := ""
		if currentUser.USN != nil {
			usnStr = *currentUser.USN
		}
		targetUSNs = []string{usnStr}
	} else {
		// Enforce limit of 4 additional people (so max 5 total in one go)
		if len(targetUSNs) > 5 {
			http.Error(w, "Cannot register more than 5 people at once", http.StatusBadRequest)
			return
		}
	}

	// Use Transaction to ensure all-or-nothing registration
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		for _, usn := range targetUSNs {
			usn = strings.TrimSpace(usn)
			if usn == "" {
				continue
			}

			// Find user by USN (Case Insensitive)
			var targetUser models.User
			query := tx
			if strings.Contains(usn, "@") {
				query = query.Where("LOWER(email) = LOWER(?)", usn)
			} else {
				query = query.Where("LOWER(usn) = LOWER(?)", usn)
			}

			if err := query.First(&targetUser).Error; err != nil {
				return fmt.Errorf("User %s not found (Verify USN or Email)", usn)
			}

			// Check if already registered
			var existing models.ActivityRegistration
			checkErr := tx.Where("activity_id = ? AND user_id = ?", input.ActivityID, targetUser.ID).First(&existing).Error
			if checkErr == nil {
				// Found existing registration
				log.Printf("DEBUG: Found existing registration for user %s (ID: %s) in activity %s", usn, targetUser.ID, input.ActivityID)

				// If it's the current requesting user, just skip silenty (allow adding friends)
				if targetUser.ID == currentUser.ID {
					continue
				}
				// If it's another user (friend), allow them to know it failed
				return fmt.Errorf("USN %s is already registered for this activity", usn)
			} else {
				log.Printf("DEBUG: No existing registration found for user %s (ID: %s) in activity %s. Error: %v", usn, targetUser.ID, input.ActivityID, checkErr)
			}

			usnStr := ""
			if targetUser.USN != nil {
				usnStr = *targetUser.USN
			}
			reg := models.ActivityRegistration{
				ActivityID: input.ActivityID,
				UserID:     targetUser.ID,
				UserUSN:    usnStr,
				Status:     "registered",
			}
			if err := tx.Create(&reg).Error; err != nil {
				// Check for unique constraint violation (Postgres error 23505)
				if strings.Contains(err.Error(), "duplicate key value violates unique constraint") || strings.Contains(err.Error(), "idx_activity_user") {
					// If it's the current requesting user, just skip silenty
					if targetUser.ID == currentUser.ID {
						continue
					}
					return fmt.Errorf("USN %s is already registered for this activity", usn)
				}
				return fmt.Errorf("Failed to register %s: %v", usn, err)
			}
		}
		return nil
	})

	if err != nil {
		// Return the specific error message to the frontend
		// Format generic error response to match frontend expectations
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": err.Error(),
			"errors":  []string{err.Error()},
		})
		return
	}

	response := map[string]interface{}{
		"success_count":   len(targetUSNs),
		"registered_usns": targetUSNs,
		"message":         "Registration process completed successfully",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

}

func HandleTeamRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := getTokenFromRequest(r)
	userID := helpers.GetUserIDFromToken(token)
	if userID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		ActivityID uuid.UUID `json:"activity_id"`
		TeamName   string    `json:"team_name"`
		USNs       []string  `json:"usns"` // List of USNs including the lead
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if input.TeamName == "" {
		http.Error(w, "Team name is required", http.StatusBadRequest)
		return
	}

	// Use Transaction
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Create Team
		team := models.Team{
			Name:       input.TeamName,
			ActivityID: input.ActivityID,
			LeadID:     userID,
		}
		if err := tx.Create(&team).Error; err != nil {
			return fmt.Errorf("failed to create team: %v", err)
		}

		// 2. Register each member
		for _, usn := range input.USNs {
			usnOrEmail := strings.TrimSpace(usn)
			if usnOrEmail == "" {
				continue
			}

			var member models.User
			query := tx
			if strings.Contains(usnOrEmail, "@") {
				query = query.Where("LOWER(email) = LOWER(?)", usnOrEmail)
			} else {
				query = query.Where("LOWER(usn) = LOWER(?)", usnOrEmail)
			}

			if err := query.First(&member).Error; err != nil {
				return fmt.Errorf("User %s not found (Verify USN or Email)", usn)
			}

			// Check if already registered
			var existing models.ActivityRegistration
			if err := tx.Where("activity_id = ? AND user_id = ?", input.ActivityID, member.ID).First(&existing).Error; err == nil {
				return fmt.Errorf("User %s is already registered", usn)
			}

			usnStr := ""
			if member.USN != nil {
				usnStr = *member.USN
			}

			reg := models.ActivityRegistration{
				ActivityID: input.ActivityID,
				UserID:     member.ID,
				UserUSN:    usnStr,
				TeamID:     &team.ID,
				TeamName:   team.Name,
				Status:     "registered",
			}
			if err := tx.Create(&reg).Error; err != nil {
				return fmt.Errorf("failed to register %s: %v", usn, err)
			}
		}
		return nil
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Team registered successfully"})
}

func GetTeamDetails(w http.ResponseWriter, r *http.Request) {
	teamID := r.URL.Query().Get("team_id")
	if teamID == "" {
		http.Error(w, "Team ID required", http.StatusBadRequest)
		return
	}

	var team models.Team
	if err := database.DB.First(&team, "id = ?", teamID).Error; err != nil {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}

	var members []models.ActivityRegistration
	if err := database.DB.Preload("User").Where("team_id = ?", teamID).Find(&members).Error; err != nil {
		http.Error(w, "Failed to fetch members", http.StatusInternalServerError)
		return
	}

	// Fetch Lead details explicitly to be safe
	var lead models.User
	database.DB.First(&lead, "id = ?", team.LeadID)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"team":    team,
		"members": members,
		"lead":    lead,
	})
}
