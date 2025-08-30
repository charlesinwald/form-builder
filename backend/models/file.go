package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FileUpload struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Filename    string             `json:"filename" bson:"filename"`
	OriginalName string            `json:"originalName" bson:"originalName"`
	MimeType    string             `json:"mimeType" bson:"mimeType"`
	Size        int64              `json:"size" bson:"size"`
	Path        string             `json:"path" bson:"path"`
	URL         string             `json:"url" bson:"url"`
	UserID      string             `json:"userId" bson:"userId"`
	FormID      string             `json:"formId,omitempty" bson:"formId,omitempty"`
	FieldID     string             `json:"fieldId,omitempty" bson:"fieldId,omitempty"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
}

type FileUploadResponse struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	URL      string `json:"url"`
	Size     int64  `json:"size"`
	MimeType string `json:"mimeType"`
}