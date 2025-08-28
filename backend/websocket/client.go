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
		log.Printf("WebSocket connection attempt from %s", c.IP())
		log.Printf("Request headers: %+v", c.GetReqHeaders())
		
		// Extract and validate auth token from query parameter
		token := c.Query("token")
		if token == "" {
			log.Printf("WebSocket connection rejected: no token provided")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication token required",
			})
		}

		log.Printf("WebSocket token received (length: %d, first 10 chars: %s...)", len(token), token[:min(len(token), 10)])

		// Validate the token
		claims, err := authService.ValidateToken(token)
		if err != nil {
			log.Printf("WebSocket token validation failed: %v", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token: " + err.Error(),
			})
		}

		log.Printf("WebSocket token validated successfully for user: %s (%s)", claims.UserID, claims.Email)

		// Check if request is a WebSocket upgrade
		if websocket.IsWebSocketUpgrade(c) {
			log.Printf("WebSocket upgrade request confirmed, creating connection...")
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

				log.Printf("WebSocket client created: ID=%s, UserID=%s, Email=%s", clientID, claims.UserID, claims.Email)

				client.Hub.register <- client

				// Start goroutines for reading and writing
				go client.writePump()
				client.readPump()
			})(c)
		}

		log.Printf("WebSocket connection rejected: not a WebSocket upgrade request")
		log.Printf("Connection header: %s", c.Get("Connection"))
		log.Printf("Upgrade header: %s", c.Get("Upgrade"))
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
	log.Printf("Starting readPump for client %s (user: %s)", c.ID, c.UserID)
	defer func() {
		log.Printf("Stopping readPump for client %s (user: %s)", c.ID, c.UserID)
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		log.Printf("Received pong from client %s", c.ID)
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		messageType, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket unexpected close error for client %s: %v", c.ID, err)
			} else {
				log.Printf("WebSocket connection closed for client %s: %v", c.ID, err)
			}
			break
		}

		if messageType == websocket.TextMessage {
			log.Printf("Received message from client %s: %s", c.ID, string(message))
			// Parse client message
			var msg ClientMessage
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("Error parsing client message from %s: %v", c.ID, err)
				continue
			}

			log.Printf("Parsed message from client %s: Type=%s, FormID=%s, Action=%s", c.ID, msg.Type, msg.FormID, msg.Action)

			// Handle different message types
			switch msg.Type {
			case "subscribe":
				if msg.FormID != "" {
					log.Printf("Client %s requesting subscription to form %s", c.ID, msg.FormID)
					// Validate that the user owns this form before allowing subscription
					if c.Hub.ValidateFormAccess(c.UserID, msg.FormID) {
						log.Printf("Form access validated, subscribing client %s to form %s", c.ID, msg.FormID)
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
								log.Printf("Sent subscription confirmation to client %s for form %s", c.ID, msg.FormID)
							default:
								log.Printf("Failed to send subscription confirmation to client %s (channel full)", c.ID)
							}
						}
					} else {
						log.Printf("Form access denied for client %s to form %s", c.ID, msg.FormID)
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
								log.Printf("Sent access denied message to client %s for form %s", c.ID, msg.FormID)
							default:
								log.Printf("Failed to send access denied message to client %s (channel full)", c.ID)
							}
						}
					}
				} else {
					log.Printf("Client %s sent subscribe message without FormID", c.ID)
				}
				
			case "unsubscribe":
				if msg.FormID != "" {
					log.Printf("Client %s requesting unsubscription from form %s", c.ID, msg.FormID)
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
							log.Printf("Sent unsubscription confirmation to client %s for form %s", c.ID, msg.FormID)
						default:
							log.Printf("Failed to send unsubscription confirmation to client %s (channel full)", c.ID)
						}
					}
				} else {
					log.Printf("Client %s sent unsubscribe message without FormID", c.ID)
				}
				
			case "ping":
				log.Printf("Received ping from client %s", c.ID)
				// Respond with pong
				response := Message{
					Type:      "pong",
					Timestamp: time.Now(),
				}
				if data, err := json.Marshal(response); err == nil {
					select {
					case c.Send <- data:
						log.Printf("Sent pong to client %s", c.ID)
					default:
						log.Printf("Failed to send pong to client %s (channel full)", c.ID)
					}
				}
			default:
				log.Printf("Unknown message type '%s' from client %s", msg.Type, c.ID)
			}
		} else {
			log.Printf("Received non-text message from client %s, type: %d", c.ID, messageType)
		}
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	log.Printf("Starting writePump for client %s (user: %s)", c.ID, c.UserID)
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		log.Printf("Stopping writePump for client %s (user: %s)", c.ID, c.UserID)
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				log.Printf("Send channel closed for client %s, sending close message", c.ID)
				// The hub closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			log.Printf("Sending message to client %s: %s", c.ID, string(message))
			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("Failed to write message to client %s: %v", c.ID, err)
				return
			}

			// Add queued messages to the current websocket message
			n := len(c.Send)
			if n > 0 {
				log.Printf("Sending %d queued messages to client %s", n, c.ID)
			}
			for i := 0; i < n; i++ {
				if err := c.Conn.WriteMessage(websocket.TextMessage, <-c.Send); err != nil {
					log.Printf("Failed to write queued message to client %s: %v", c.ID, err)
					return
				}
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			log.Printf("Sending ping to client %s", c.ID)
			if err := c.Conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				log.Printf("Failed to send ping to client %s: %v", c.ID, err)
				return
			}
		}
	}
}

