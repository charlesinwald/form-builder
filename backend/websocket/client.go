package websocket

import (
	"encoding/json"
	"log"
	"time"

	"form-builder-backend/services"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 512
)

// ClientMessage represents a message from the client
type ClientMessage struct {
	Type    string `json:"type"`
	FormID  string `json:"formId,omitempty"`
	Action  string `json:"action,omitempty"`
}

// HandleWebSocket handles WebSocket upgrade and creates a new client
func HandleWebSocket(hub *Hub, authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extract and validate auth token from query parameter
		token := c.Query("token")
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication token required",
			})
		}

		// Validate the token
		claims, err := authService.ValidateToken(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token: " + err.Error(),
			})
		}

		// Check if request is a WebSocket upgrade
		if websocket.IsWebSocketUpgrade(c) {
			return websocket.New(func(conn *websocket.Conn) {
				clientID := uuid.New().String()
				client := &Client{
					ID:        clientID,
					UserID:    claims.UserID,
					UserEmail: claims.Email,
					Hub:       hub,
					Conn:      conn,
					Send:      make(chan []byte, 256),
					FormIDs:   make(map[string]bool),
				}

				client.Hub.register <- client

				// Start goroutines for reading and writing
				go client.writePump()
				client.readPump()
			})(c)
		}

		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "WebSocket upgrade required",
		})
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}


// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		messageType, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		if messageType == websocket.TextMessage {
			// Parse client message
			var msg ClientMessage
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("Error parsing client message: %v", err)
				continue
			}

			// Handle different message types
			switch msg.Type {
			case "subscribe":
				if msg.FormID != "" {
					// Validate that the user owns this form before allowing subscription
					if c.Hub.ValidateFormAccess(c.UserID, msg.FormID) {
						c.Hub.SubscribeToForm(c, msg.FormID)
						// Send confirmation
						response := Message{
							Type:      "subscribed",
							FormID:    msg.FormID,
							Timestamp: time.Now(),
						}
						if data, err := json.Marshal(response); err == nil {
							select {
							case c.Send <- data:
							default:
							}
						}
					} else {
						// Send error response
						response := Message{
							Type:      "error",
							FormID:    msg.FormID,
							Timestamp: time.Now(),
							Data:      "Access denied: You don't have permission to access this form",
						}
						if data, err := json.Marshal(response); err == nil {
							select {
							case c.Send <- data:
							default:
							}
						}
					}
				}
				
			case "unsubscribe":
				if msg.FormID != "" {
					c.Hub.UnsubscribeFromForm(c, msg.FormID)
					// Send confirmation
					response := Message{
						Type:      "unsubscribed",
						FormID:    msg.FormID,
						Timestamp: time.Now(),
					}
					if data, err := json.Marshal(response); err == nil {
						select {
						case c.Send <- data:
						default:
						}
					}
				}
				
			case "ping":
				// Respond with pong
				response := Message{
					Type:      "pong",
					Timestamp: time.Now(),
				}
				if data, err := json.Marshal(response); err == nil {
					select {
					case c.Send <- data:
					default:
					}
				}
			}
		}
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

			// Add queued messages to the current websocket message
			n := len(c.Send)
			for i := 0; i < n; i++ {
				if err := c.Conn.WriteMessage(websocket.TextMessage, <-c.Send); err != nil {
					return
				}
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

