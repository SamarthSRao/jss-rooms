# JSS Rooms - Architecture and Application Flow

This document outlines the complete architecture and data flow of the JSS Rooms application, updated to reflect the recent refactoring into a modular backend structure.

## 1. System Overview

**JSS Rooms** is a real-time collaboration and event management platform designed for college students. It features:
- **Authentication**: Secure login/registration with USN and Password.
- **Real-Time Chat**: Ephemeral chat rooms with strict timer limits.
- **Event Management**: Admin-curated events and activities.
- **Digital Ticketing**: QR-code based registration and check-in system.

## 2. Backend Architecture (`/backend`)

The backend is built with **Go (Golang)** and follows a modular, package-based architecture to ensure separation of concerns.

### 2.1 Project Structure
*   **`main.go`**: The entry point. It initializes the database, starts the WebSocket hub, sets up routes, and launches the HTTP server.
*   **`database/`**: Manages the PostgreSQL connection (`GORM`) and handles auto-migrations.
*   **`models/`**: Defines the data structures (structs) that map to database tables (User, Room, Message, Event, etc.).
*   **`routes/`**: Centralizes API route definitions, mapping URLs to controller functions and applying middleware.
*   **`middleware/`**: Interceptors for HTTP requests.
    *   `AuthMiddleware`: Protects routes requires a valid JWT.
    *   `AdminMiddleware`: Ensures the user has 'admin' privileges.
*   **`controllers/`**: Contains the core business logic.
    *   `handlers.go`: Logic for Rooms, Events, Activities, and WebSockets.
    *   `userController.go`: Logic for User Registration, Login, and Profiles.
*   **`ws/`**: Handles WebSocket connections.
    *   `hub.go`: Manages active clients and broadcasts messages.
    *   `client.go`: Handles individual websocket read/write pumps.
*   **`helpers/`**: Utility functions for Password Hashing (Bcrypt) and JWT generation/validation.

### 2.2 Database Schema
The application uses **PostgreSQL**. Key relationships include:
*   **Users**: Stores credentials (hashed), USN, and Role.
*   **Rooms**: Chat rooms created by admins. Have a 6-digit numeric ID.
*   **Messages**: Linked to a Room and User.
*   **Events**: Main college events (e.g., "Tech Fest").
*   **Activities**: Sub-events (e.g., "Coding Contest") usually linked to an Event.
*   **Registrations**: Links a User to an Event/Activity, containing a unique `QRCodeToken`.

---

## 3. Detailed Application Flows

### 3.1 Authentication Flow
Security is handled via **JWT (JSON Web Tokens)**.

1.  **Registration (`POST /api/register`)**:
    *   Frontend sends USN, Password, and Name.
    *   Backend hashes the password using `bcrypt`.
    *   User is saved to DB.
    *   A JWT is signed (containing User ID & Role) and returned.
2.  **Login (`POST /api/login`)**:
    *   Frontend sends USN and Password.
    *   Backend fetches user by USN.
    *   Backend compares hashed input password with stored hash.
    *   If payload matches, a new JWT is returned.
3.  **Authorization**:
    *   Frontend stores JWT in `localStorage`.
    *   For protected requests (e.g., `GET /api/profile`), Frontend adds header: `Authorization: Bearer <token>`.
    *   `AuthMiddleware` parses the token; if invalid/expired, returns 401 Unauthorized.

### 3.2 Real-Time Chat Flow
Chat functionality is powered by **WebSockets**.

1.  **Room Creation**:
    *   Admin sends `POST /api/rooms` with title and timer settings.
    *   Room is saved to DB with a generated 6-digit ID.
2.  **Joining a Room**:
    *   Frontend connects to `ws://.../ws?room=<roomID>&usn=<usn>&userId=<id>`.
    *   Backend upgrades HTTP connection to WebSocket.
    *   Client is registered to the central `Hub`.
    *   Backend fetches last 100 messages from DB and sends them to the new client immediately.
3.  **Messaging**:
    *   User types a message.
    *   Message is sent over WebSocket connection.
    *   Backend saves message to `messages` table.
    *   `Hub` broadcasts the message to all other clients connected to that specific `roomID`.

### 3.3 Event & Check-In Flow
This flow manages the lifecycle of attending an event.

1.  **Browsing**:
    *   User visits Explore page.
    *   Frontend fetches `GET /api/activities`.
2.  **Registration**:
    *   User clicks "Register".
    *   Frontend sends `POST /api/activities/register`.
    *   Backend creates a `Registration` record and generates a unique `QRCodeToken` (UUID).
    *   Backend returns success.
3.  **Ticket Generation**:
    *   Frontend generates a QR code image from the `QRCodeToken`.
    *   This is displayed on the user's Profile or Activity Details page.
4.  **Check-In (Admin Side)**:
    *   Admin uses the "Check-In" scanner page.
    *   Admin scans User's QR code.
    *   Frontend sends `POST /api/events/checkin` with the token.
    *   Backend searches for a registration matching that token.
    *   If found: Updates status to `checked_in` and returns User details.
    *   If not found/already used: Returns error.

## 4. Frontend Integration
The Frontend (React + Vite) mirrors this structure:
- **`src/pages/Login.jsx`**: Handles Auth flow.
- **`src/pages/Explore.jsx`**: Displays Rooms and Activities.
- **`src/pages/Room.jsx`**: Manages WebSocket connection and chat UI.
- **`src/pages/Profile.jsx`**: Shows User info and Registered Activities (QR Codes).
- **`src/pages/AdminDashboard.jsx`**: Admin controls for creating contents.
- **`src/pages/CheckIn.jsx`**: Admin QR scanner interface.
