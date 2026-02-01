package middleware

import (
	"net/http"
	"strings"

	"github.com/jssrooms/backend/helpers"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "authorization header is required", http.StatusUnauthorized)
			return
		}

		// Support "Bearer <token>" format
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		claims, err := helpers.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Note: In a full implementation, we should add claims to r.Context() here
		// For now, we just validate access.
		_ = claims

		next.ServeHTTP(w, r)
	}
}

func AdminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "authorization header is required", http.StatusUnauthorized)
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		claims, err := helpers.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claims.Role != "admin" {
			http.Error(w, "forbidden: admin access only", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	}
}
