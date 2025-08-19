package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FormResponse struct {
	ID        primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	FormID    primitive.ObjectID     `json:"formId" bson:"formId"`
	Data      map[string]interface{} `json:"data" bson:"data"`
	CreatedAt time.Time              `json:"createdAt" bson:"createdAt"`
	IPAddress string                 `json:"ipAddress" bson:"ipAddress"`
	UserAgent string                 `json:"userAgent" bson:"userAgent"`
}