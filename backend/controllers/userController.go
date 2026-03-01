package controllers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/jssrooms/backend/database"
	"github.com/jssrooms/backend/helpers"
	"github.com/jssrooms/backend/models"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		USN      string `json:"usn"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if input.USN == "" && input.Email == "" {
		http.Error(w, "USN or Email is required", http.StatusBadRequest)
		return
	}
	if input.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	// USN Regex Validation (only if provided)
	if input.USN != "" {
		usnRegex := regexp.MustCompile(`^1JS\d{2}[A-Z]{2}\d{3}$`)
		if !usnRegex.MatchString(input.USN) {
			http.Error(w, "Invalid USN format. Expected: 1JSYYBBSSS", http.StatusBadRequest)
			return
		}

		var existingUser models.User
		if err := database.DB.Where("usn = ?", input.USN).First(&existingUser).Error; err == nil {
			http.Error(w, "USN already registered. Please login.", http.StatusConflict)
			return
		}
	}

	// Email Validation (only if provided)
	if input.Email != "" {
		emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
		if !emailRegex.MatchString(strings.ToLower(input.Email)) {
			http.Error(w, "Invalid email format", http.StatusBadRequest)
			return
		}

		var existingUser models.User
		if err := database.DB.Where("LOWER(email) = LOWER(?)", input.Email).First(&existingUser).Error; err == nil {
			http.Error(w, "Email already registered. Please login.", http.StatusConflict)
			return
		}
	}

	hashedPassword, err := helpers.HashPassword(input.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	role := input.Role
	if role == "" {
		role = "user"
	}

	var usnPtr *string
	if input.USN != "" {
		usnPtr = &input.USN
	}

	var emailPtr *string
	if input.Email != "" {
		emailPtr = &input.Email
	}

	user := models.User{
		USN:      usnPtr,
		Email:    emailPtr,
		Password: hashedPassword,
		Role:     role,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		http.Error(w, "Could not register user", http.StatusInternalServerError)
		return
	}

	writeTokenResponse(w, user)
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Identifier string `json:"identifier"` // USN or Email
		Password   string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	var user models.User
	result := database.DB.Where("LOWER(usn) = LOWER(?) OR LOWER(email) = LOWER(?)", input.Identifier, input.Identifier).First(&user)
	if result.Error != nil {
		http.Error(w, "User not found. Please register first.", http.StatusNotFound)
		return
	}

	err := helpers.VerifyPassword(user.Password, input.Password)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	writeTokenResponse(w, user)
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	token := getTokenFromRequest(r)
	userID := helpers.GetUserIDFromToken(token)

	if userID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if r.Method == http.MethodGet {
		var user models.User
		if err := database.DB.Preload("Group").Preload("ActivityRegistrations.Activity").First(&user, "id = ?", userID).Error; err != nil {
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
			College      string    `json:"college"`
			Year         string    `json:"year"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(models.User{
			Name:         input.Name,
			Bio:          input.Bio,
			ProfileImage: input.ProfileImage,
			GroupID:      &input.GroupID,
			College:      input.College,
			Year:         input.Year,
		})
		w.WriteHeader(http.StatusNoContent)
		return
	}
}

func writeTokenResponse(w http.ResponseWriter, user models.User) {
	tokenString, err := helpers.GenerateToken(user.USN, user.Email, user.ID, user.Role)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}
