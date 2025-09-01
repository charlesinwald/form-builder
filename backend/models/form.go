package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ConditionalRule struct {
	ID              string      `json:"id" bson:"id"`
	FieldID         string      `json:"fieldId" bson:"fieldId"`
	Operator        string      `json:"operator" bson:"operator"`
	Value           interface{} `json:"value" bson:"value"`
	LogicalOperator string      `json:"logicalOperator,omitempty" bson:"logicalOperator,omitempty"`
}

type ConditionalLogic struct {
	ID         string            `json:"id" bson:"id"`
	Action     string            `json:"action" bson:"action"`
	Rules      []ConditionalRule `json:"rules" bson:"rules"`
	TargetType string            `json:"targetType" bson:"targetType"`
	TargetID   string            `json:"targetId" bson:"targetId"`
}

type FormSection struct {
	ID              string             `json:"id" bson:"id"`
	Title           string             `json:"title" bson:"title"`
	Description     string             `json:"description,omitempty" bson:"description,omitempty"`
	Fields          []string           `json:"fields" bson:"fields"`
	ConditionalLogic []ConditionalLogic `json:"conditionalLogic,omitempty" bson:"conditionalLogic,omitempty"`
}

type FormPage struct {
	ID               string             `json:"id" bson:"id"`
	Title            string             `json:"title" bson:"title"`
	Sections         []string           `json:"sections" bson:"sections"`
	ConditionalLogic []ConditionalLogic `json:"conditionalLogic,omitempty" bson:"conditionalLogic,omitempty"`
}

type CheckboxOptions struct {
	MaxSelection *int `json:"maxSelection,omitempty" bson:"maxSelection,omitempty"`
	MinSelection *int `json:"minSelection,omitempty" bson:"minSelection,omitempty"`
}

type FileOptions struct {
	Accept   *string `json:"accept,omitempty" bson:"accept,omitempty"`
	Multiple *bool   `json:"multiple,omitempty" bson:"multiple,omitempty"`
	MaxSize  *int    `json:"maxSize,omitempty" bson:"maxSize,omitempty"` // in MB
}

type FormField struct {
	ID               string                 `json:"id" bson:"id"`
	Type             string                 `json:"type" bson:"type"`
	Label            string                 `json:"label" bson:"label"`
	Description      string                 `json:"description,omitempty" bson:"description,omitempty"`
	Required         bool                   `json:"required" bson:"required"`
	Options          []string               `json:"options,omitempty" bson:"options,omitempty"`
	Validation       map[string]interface{} `json:"validation,omitempty" bson:"validation,omitempty"`
	Placeholder      string                 `json:"placeholder,omitempty" bson:"placeholder,omitempty"`
	CheckboxOptions  *CheckboxOptions       `json:"checkboxOptions,omitempty" bson:"checkboxOptions,omitempty"`
	FileOptions      *FileOptions           `json:"fileOptions,omitempty" bson:"fileOptions,omitempty"`
	SectionID        string                 `json:"sectionId,omitempty" bson:"sectionId,omitempty"`
	ConditionalLogic []ConditionalLogic     `json:"conditionalLogic,omitempty" bson:"conditionalLogic,omitempty"`
}

type Form struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title            string             `json:"title" bson:"title"`
	Description      string             `json:"description" bson:"description"`
	Fields           []FormField        `json:"fields" bson:"fields"`
	Sections         []FormSection      `json:"sections,omitempty" bson:"sections,omitempty"`
	Pages            []FormPage         `json:"pages,omitempty" bson:"pages,omitempty"`
	Status           string             `json:"status" bson:"status"` // "draft", "published", "archived"
	CreatedAt        time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt        time.Time          `json:"updatedAt" bson:"updatedAt"`
	IsActive         bool               `json:"isActive" bson:"isActive"`
	UserID           string             `json:"userId" bson:"userId"`
	ResponseCount    int                `json:"responseCount" bson:"-"` // Not stored in DB, calculated
	ConditionalLogic []ConditionalLogic `json:"conditionalLogic,omitempty" bson:"conditionalLogic,omitempty"`
}

type CreateFormRequest struct {
	Title            string             `json:"title" validate:"required"`
	Description      string             `json:"description"`
	Fields           []FormField        `json:"fields"`
	Sections         []FormSection      `json:"sections,omitempty"`
	Pages            []FormPage         `json:"pages,omitempty"`
	Status           string             `json:"status"`
	ConditionalLogic []ConditionalLogic `json:"conditionalLogic,omitempty"`
}

type UpdateFormRequest struct {
	Title            *string             `json:"title,omitempty"`
	Description      *string             `json:"description,omitempty"`
	Fields           *[]FormField        `json:"fields,omitempty"`
	Sections         *[]FormSection      `json:"sections,omitempty"`
	Pages            *[]FormPage         `json:"pages,omitempty"`
	Status           *string             `json:"status,omitempty"`
	IsActive         *bool               `json:"isActive,omitempty"`
	ConditionalLogic *[]ConditionalLogic `json:"conditionalLogic,omitempty"`
}