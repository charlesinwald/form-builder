package middleware

import (
	"strings"

	"form-builder-backend/services"

	"github.com/gofiber/fiber/v2"
)

type AuthMiddleware struct {
	authService *services.AuthService
}

func NewAuthMiddleware(authService *services.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

func (m *AuthMiddleware) RequireAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Authorization header required",
			})
		}

		// Check for Bearer token
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		token := tokenParts[1]

		// Validate token
		claims, err := m.authService.ValidateToken(token)
		if err != nil {
			if err == services.ErrTokenExpired {
				return c.Status(401).JSON(fiber.Map{
					"error": "Token has expired",
				})
			}
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		// Set user info in context
		c.Locals("userID", claims.UserID)
		c.Locals("userEmail", claims.Email)

		return c.Next()
	}
}

func (m *AuthMiddleware) OptionalAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}

		// Check for Bearer token
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			return c.Next()
		}

		token := tokenParts[1]

		// Validate token
		claims, err := m.authService.ValidateToken(token)
		if err != nil {
			// For optional auth, we don't fail on invalid tokens
			return c.Next()
		}

		// Set user info in context
		c.Locals("userID", claims.UserID)
		c.Locals("userEmail", claims.Email)

		return c.Next()
	}
}

// GetUserID helper function to get user ID from context
func GetUserID(c *fiber.Ctx) string {
	userID, ok := c.Locals("userID").(string)
	if !ok {
		return ""
	}
	return userID
}

// GetUserEmail helper function to get user email from context
func GetUserEmail(c *fiber.Ctx) string {
	userEmail, ok := c.Locals("userEmail").(string)
	if !ok {
		return ""
	}
	return userEmail
}