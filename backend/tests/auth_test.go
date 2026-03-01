package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"
)

const baseURL = "http://127.0.0.1:8081/api" // Adjust if your port is different

func TestAuthFlows(t *testing.T) {
	// 1. Test Email Registration
	email := fmt.Sprintf("test_%d@example.com", time.Now().UnixNano()) // Truly unique email
	regPayload := map[string]string{
		"email":    email,
		"password": "password123",
		"role":     "user",
	}

	resp, err := postJSON(baseURL+"/register", regPayload)
	if err != nil {
		t.Fatalf("Failed to register: %v", err)
	}
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var body bytes.Buffer
		body.ReadFrom(resp.Body)
		t.Errorf("Email registration failed with status %d: %s", resp.StatusCode, body.String())
	}

	// 2. Test Email Login
	loginPayload := map[string]string{
		"identifier": email,
		"password":   "password123",
	}
	resp, err = postJSON(baseURL+"/login", loginPayload)
	if err != nil {
		t.Fatalf("Failed to login: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		var body bytes.Buffer
		body.ReadFrom(resp.Body)
		t.Errorf("Email login failed with status %d: %s", resp.StatusCode, body.String())
	}
}

func postJSON(url string, data interface{}) (*http.Response, error) {
	jsonData, _ := json.Marshal(data)
	return http.Post(url, "application/json", bytes.NewBuffer(jsonData))
}
