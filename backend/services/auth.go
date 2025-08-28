package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"form-builder-backend/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db *mongo.Database
}

type JWTClaims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailExists        = errors.New("user with this email already exists")
	ErrInvalidToken       = errors.New("invalid token")
	ErrTokenExpired       = errors.New("token has expired")
)

func NewAuthService(db *mongo.Database) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.AuthResponse, error) {
	collection := s.db.Collection("users")
	
	// Check if user already exists
	var existingUser models.User
	err := collection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		return nil, ErrEmailExists
	} else if err != mongo.ErrNoDocuments {
		return nil, fmt.Errorf("database error: %w", err)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := models.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		FirstName: req.FirstName,
		LastName:  req.LastName,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	user.ID = result.InsertedID.(primitive.ObjectID)

	// Generate tokens
	token, refreshToken, err := s.generateTokens(user.ID.Hex(), user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Login(req models.LoginRequest) (*models.AuthResponse, error) {
	collection := s.db.Collection("users")
	
	// Find user by email
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{
		"email":    req.Email,
		"isActive": true,
	}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Update last login
	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{"updatedAt": time.Now()}},
	)
	if err != nil {
		// Log but don't fail login
		fmt.Printf("Failed to update user last login: %v\n", err)
	}

	// Generate tokens
	token, refreshToken, err := s.generateTokens(user.ID.Hex(), user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*models.AuthResponse, error) {
	claims, err := s.validateToken(refreshToken, true)
	if err != nil {
		return nil, err
	}

	// Get user from database
	collection := s.db.Collection("users")
	objID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	var user models.User
	err = collection.FindOne(context.Background(), bson.M{
		"_id":      objID,
		"isActive": true,
	}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	// Generate new tokens
	newToken, newRefreshToken, err := s.generateTokens(user.ID.Hex(), user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &models.AuthResponse{
		User:         user,
		Token:        newToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *AuthService) GetUser(userID string) (*models.User, error) {
	collection := s.db.Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	var user models.User
	err = collection.FindOne(context.Background(), bson.M{
		"_id":      objID,
		"isActive": true,
	}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	return &user, nil
}

func (s *AuthService) UpdateUser(userID string, req models.UpdateUserRequest) (*models.User, error) {
	collection := s.db.Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	if req.FirstName != nil {
		update["$set"].(bson.M)["firstName"] = *req.FirstName
	}
	if req.LastName != nil {
		update["$set"].(bson.M)["lastName"] = *req.LastName
	}
	if req.Email != nil {
		// Check if new email is already taken
		var existingUser models.User
		err := collection.FindOne(context.Background(), bson.M{
			"email": *req.Email,
			"_id":   bson.M{"$ne": objID},
		}).Decode(&existingUser)
		if err == nil {
			return nil, ErrEmailExists
		} else if err != mongo.ErrNoDocuments {
			return nil, fmt.Errorf("database error: %w", err)
		}
		update["$set"].(bson.M)["email"] = *req.Email
	}

	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	if result.MatchedCount == 0 {
		return nil, ErrUserNotFound
	}

	// Return updated user
	var updatedUser models.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedUser)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated user: %w", err)
	}

	return &updatedUser, nil
}

func (s *AuthService) ChangePassword(userID string, req models.ChangePasswordRequest) error {
	collection := s.db.Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return ErrInvalidToken
	}

	// Get current user
	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrUserNotFound
		}
		return fmt.Errorf("database error: %w", err)
	}

	// Verify current password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword))
	if err != nil {
		return ErrInvalidCredentials
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{
			"password":  string(hashedPassword),
			"updatedAt": time.Now(),
		}},
	)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

func (s *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	log.Printf("Validating token (length: %d)", len(tokenString))
	claims, err := s.validateToken(tokenString, false)
	if err != nil {
		log.Printf("Token validation failed: %v", err)
		return nil, err
	}
	log.Printf("Token validation successful for user: %s (%s)", claims.UserID, claims.Email)
	return claims, nil
}

func (s *AuthService) generateTokens(userID, email string) (string, string, error) {
	jwtSecret := s.getJWTSecret()
	
	// Generate access token (15 minutes)
	accessClaims := JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   userID,
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", "", err
	}

	// Generate refresh token (7 days)
	refreshClaims := JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   userID,
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

func (s *AuthService) validateToken(tokenString string, isRefreshToken bool) (*JWTClaims, error) {
	log.Printf("Starting token validation, isRefreshToken: %v", isRefreshToken)
	
	jwtSecret := s.getJWTSecret()
	log.Printf("Using JWT secret (length: %d)", len(jwtSecret))

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		log.Printf("Token signing method: %v", token.Header["alg"])
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			log.Printf("Unexpected signing method: %v", token.Header["alg"])
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		log.Printf("JWT parsing error: %v", err)
		if errors.Is(err, jwt.ErrTokenExpired) {
			log.Printf("Token has expired")
			return nil, ErrTokenExpired
		}
		log.Printf("Token is invalid: %v", err)
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		log.Printf("Token claims extracted successfully: UserID=%s, Email=%s, Exp=%v", 
			claims.UserID, claims.Email, claims.ExpiresAt)
		return claims, nil
	}

	log.Printf("Token claims are invalid or token is not valid")
	return nil, ErrInvalidToken
}

func (s *AuthService) getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-super-secret-jwt-key-change-this-in-production"
	}
	return secret
}