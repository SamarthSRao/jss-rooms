package routes

import (
	"net/http"

	"github.com/jssrooms/backend/controllers"
	"github.com/jssrooms/backend/middleware"
)

func SetupRoutes(mux *http.ServeMux) {
	// Public routes
	mux.HandleFunc("/api/login", controllers.Login)
	mux.HandleFunc("/api/register", controllers.Register)
	mux.HandleFunc("/api/rooms", controllers.HandleRooms)
	mux.HandleFunc("/api/events", controllers.HandleEvents)
	mux.HandleFunc("/api/activities", controllers.HandleActivities)
	mux.HandleFunc("/ws", controllers.HandleWebSocket)

	// Admin routes
	mux.HandleFunc("/api/rooms/close", middleware.AdminMiddleware(controllers.HandleCloseRoom))
	mux.HandleFunc("/api/events/checkin", middleware.AdminMiddleware(controllers.HandleEventCheckIn))

	// Authenticated routes
	mux.HandleFunc("/api/events/register", middleware.AuthMiddleware(controllers.HandleEventRegister))
	mux.HandleFunc("/api/events/registrations", middleware.AuthMiddleware(controllers.HandleEventRegistrations))
	mux.HandleFunc("/api/profile", middleware.AuthMiddleware(controllers.GetProfile))
	mux.HandleFunc("/api/groups", middleware.AuthMiddleware(controllers.HandleGroups))
	mux.HandleFunc("/api/activities/register", middleware.AuthMiddleware(controllers.HandleActivityRegister))
}
