package main

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	USN       string    `gorm:"uniqueIndex;not null" json:"usn"`
	Role      string    `gorm:"default:'user'" json:"role"` // 'admin' or 'user'
	CreatedAt time.Time `json:"created_at"`
}

type Room struct {
	ID           string         `gorm:"primaryKey" json:"id"` // 6-digit numeric ID
	Title        string         `gorm:"not null" json:"title"`
	Description  string         `json:"description"`
	AdminID      uuid.UUID      `gorm:"type:uuid" json:"admin_id"`
	TimerMinutes int            `json:"timer_minutes"`
	ExpiresAt    time.Time      `json:"expires_at"`
	IsClosed     bool           `gorm:"default:false" json:"is_closed"`
	CreatedAt    time.Time      `json:"created_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Message struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	RoomID    string    `gorm:"index" json:"room_id"` // Matches Room.ID string
	UserID    uuid.UUID `gorm:"type:uuid" json:"user_id"`
	UserUSN   string    `json:"user_usn"`
	Content   string    `gorm:"not null" json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type Event struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	ImageUrl    string    `json:"image_url"`
	EventDate   time.Time `json:"event_date"`
	CreatedAt   time.Time `json:"created_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}

func (r *Room) BeforeCreate(tx *gorm.DB) (err error) {
	// Generate 6-digit numeric ID
	r.ID = fmt.Sprintf("%06d", rand.Intn(1000000))
	return
}

func (m *Message) BeforeCreate(tx *gorm.DB) (err error) {
	m.ID = uuid.New()
	return
}

func (e *Event) BeforeCreate(tx *gorm.DB) (err error) {
	e.ID = uuid.New()
	return
}
