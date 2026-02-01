package helpers

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("your-secret-key")

func init() {
	key := os.Getenv("JWT_SECRET")
	if key != "" {
		jwtKey = []byte(key)
	}
}

type Claims struct {
	USN    string `json:"usn"`
	UserID string `json:"id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(usn string, userID uuid.UUID, role string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		USN:    usn,
		UserID: userID.String(),
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func ValidateToken(signedToken string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(signedToken, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, errors.New("couldn't parse claims")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token expired")
	}

	return claims, nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func GetRoleFromToken(tokenString string) string {
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return ""
	}
	return claims.Role
}

func GetUserIDFromToken(tokenString string) uuid.UUID {
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return uuid.Nil
	}
	id, _ := uuid.Parse(claims.UserID)
	return id
}
