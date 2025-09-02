package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FormResponse struct {
	ID             primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	FormID         primitive.ObjectID     `json:"formId" bson:"formId"`
	Data           map[string]interface{} `json:"data" bson:"data"`
	CreatedAt      time.Time              `json:"createdAt" bson:"createdAt"`
	IPAddress      string                 `json:"ipAddress" bson:"ipAddress"`
	UserAgent      string                 `json:"userAgent" bson:"userAgent"`
	SessionID      string                 `json:"sessionId,omitempty" bson:"sessionId,omitempty"`
	StartedAt      *time.Time             `json:"startedAt,omitempty" bson:"startedAt,omitempty"`
	CompletionTime *float64               `json:"completionTime,omitempty" bson:"completionTime,omitempty"` // Time in seconds
	IsComplete     bool                   `json:"isComplete" bson:"isComplete"`
}

type FormSession struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	SessionID string             `json:"sessionId" bson:"sessionId"`
	FormID    primitive.ObjectID `json:"formId" bson:"formId"`
	StartedAt time.Time          `json:"startedAt" bson:"startedAt"`
	LastSeen  time.Time          `json:"lastSeen" bson:"lastSeen"`
	IPAddress string             `json:"ipAddress" bson:"ipAddress"`
	UserAgent string             `json:"userAgent" bson:"userAgent"`
	IsActive  bool               `json:"isActive" bson:"isActive"`
}