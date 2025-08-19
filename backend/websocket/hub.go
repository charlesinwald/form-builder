package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
)

// Message types for WebSocket communication
const (
	MessageTypeNewResponse = "new_response"
	MessageTypeAnalyticsUpdate = "analytics_update"
	MessageTypeHeartbeat = "heartbeat"
)

// Message represents a WebSocket message
type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
	FormID    string      `json:"formId,omitempty"`
}

// Client represents a WebSocket client
type Client struct {
	ID       string
	Conn     *websocket.Conn
	Send     chan []byte
	Hub      *Hub
	FormIDs  map[string]bool // Forms this client is subscribed to
	mu       sync.RWMutex
}

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Form-specific subscriptions
	formClients map[string]map[*Client]bool
	mu          sync.RWMutex
}

// NewHub creates a new Hub
func NewHub() *Hub {
	return &Hub{
		broadcast:   make(chan []byte),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		clients:     make(map[*Client]bool),
		formClients: make(map[string]map[*Client]bool),
	}
}

// Run starts the hub
func (h *Hub) Run() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client %s connected. Total clients: %d", client.ID, len(h.clients))

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
				
				// Remove from form subscriptions
				h.mu.Lock()
				for formID := range client.FormIDs {
					if formClients, ok := h.formClients[formID]; ok {
						delete(formClients, client)
						if len(formClients) == 0 {
							delete(h.formClients, formID)
						}
					}
				}
				h.mu.Unlock()
				
				log.Printf("Client %s disconnected. Total clients: %d", client.ID, len(h.clients))
			}

		case message := <-h.broadcast:
			// Broadcast to all connected clients
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					// Client's send channel is full, close it
					close(client.Send)
					delete(h.clients, client)
				}
			}

		case <-ticker.C:
			// Send heartbeat to all clients
			heartbeat := Message{
				Type:      MessageTypeHeartbeat,
				Timestamp: time.Now(),
			}
			if data, err := json.Marshal(heartbeat); err == nil {
				for client := range h.clients {
					select {
					case client.Send <- data:
					default:
						// Client's send channel is full, skip
					}
				}
			}
		}
	}
}

// BroadcastToAll sends a message to all connected clients
func (h *Hub) BroadcastToAll(message Message) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}
	
	h.broadcast <- data
}

// BroadcastToForm sends a message to clients subscribed to a specific form
func (h *Hub) BroadcastToForm(formID string, message Message) {
	message.FormID = formID
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	h.mu.RLock()
	clients, ok := h.formClients[formID]
	h.mu.RUnlock()

	if !ok {
		return
	}

	for client := range clients {
		select {
		case client.Send <- data:
		default:
			// Client's send channel is full, skip
		}
	}
}

// SubscribeToForm subscribes a client to a specific form
func (h *Hub) SubscribeToForm(client *Client, formID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.formClients[formID] == nil {
		h.formClients[formID] = make(map[*Client]bool)
	}
	h.formClients[formID][client] = true
	
	client.mu.Lock()
	client.FormIDs[formID] = true
	client.mu.Unlock()
	
	log.Printf("Client %s subscribed to form %s", client.ID, formID)
}

// UnsubscribeFromForm unsubscribes a client from a specific form
func (h *Hub) UnsubscribeFromForm(client *Client, formID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if clients, ok := h.formClients[formID]; ok {
		delete(clients, client)
		if len(clients) == 0 {
			delete(h.formClients, formID)
		}
	}
	
	client.mu.Lock()
	delete(client.FormIDs, formID)
	client.mu.Unlock()
	
	log.Printf("Client %s unsubscribed from form %s", client.ID, formID)
}

// GetConnectedClientsCount returns the number of connected clients
func (h *Hub) GetConnectedClientsCount() int {
	return len(h.clients)
}

// GetFormSubscribersCount returns the number of clients subscribed to a form
func (h *Hub) GetFormSubscribersCount(formID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	
	if clients, ok := h.formClients[formID]; ok {
		return len(clients)
	}
	return 0
}

