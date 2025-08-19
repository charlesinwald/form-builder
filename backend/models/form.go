package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FormField struct {
	ID          string                 `json:"id" bson:"id"`
	Type        string                 `json:"type" bson:"type"`
	Label       string                 `json:"label" bson:"label"`
	Required    bool                   `json:"required" bson:"required"`
	Options     []string               `json:"options,omitempty" bson:"options,omitempty"`
	Validation  map[string]interface{} `json:"validation,omitempty" bson:"validation,omitempty"`
	Placeholder string                 `json:"placeholder,omitempty" bson:"placeholder,omitempty"`
}

type Form struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	Description string             `json:"description" bson:"description"`
	Fields      []FormField        `json:"fields" bson:"fields"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
	IsActive    bool               `json:"isActive" bson:"isActive"`
	UserID      string             `json:"userId" bson:"userId"`
}