package store

import (
	"errors"
	"sync"
	"time"

	"form-builder-backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MemoryStore provides an in-memory implementation of the data store
type MemoryStore struct {
	forms     map[string]*models.Form
	responses map[string]*models.FormResponse
	mu        sync.RWMutex
}

// NewMemoryStore creates a new in-memory store
func NewMemoryStore() *MemoryStore {
	store := &MemoryStore{
		forms:     make(map[string]*models.Form),
		responses: make(map[string]*models.FormResponse),
	}
	
	// Create a demo form for testing
	store.createDemoForm()
	
	return store
}

func (s *MemoryStore) createDemoForm() {
	demoFormID, _ := primitive.ObjectIDFromHex("6789c7f2e8b9a0d1e2f3a4b5")
	demoForm := &models.Form{
		ID:          demoFormID,
		Title:       "Demo Feedback Form",
		Description: "A demo form for testing real-time analytics",
		Fields: []models.FormField{
			{
				ID:       "name",
				Type:     "text",
				Label:    "Full Name",
				Required: true,
			},
			{
				ID:       "email",
				Type:     "email",
				Label:    "Email Address",
				Required: true,
			},
			{
				ID:       "feedback",
				Type:     "textarea",
				Label:    "Your Feedback",
				Required: false,
			},
			{
				ID:       "rating",
				Type:     "rating",
				Label:    "Overall Rating",
				Required: true,
			},
		},
		Status:    "published",
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
		IsActive:  true,
		UserID:    "default",
	}
	
	s.forms[demoFormID.Hex()] = demoForm
}

// Forms operations

func (s *MemoryStore) CreateForm(form *models.Form) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	form.ID = primitive.NewObjectID()
	form.CreatedAt = time.Now()
	form.UpdatedAt = time.Now()
	
	s.forms[form.ID.Hex()] = form
	return nil
}

func (s *MemoryStore) GetForm(id string) (*models.Form, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	form, exists := s.forms[id]
	if !exists {
		return nil, errors.New("form not found")
	}
	
	return form, nil
}

func (s *MemoryStore) GetForms(userID string, status string) ([]*models.Form, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var forms []*models.Form
	for _, form := range s.forms {
		if form.UserID == userID {
			if status == "" || form.Status == status {
				// Count responses for this form
				responseCount := 0
				for _, resp := range s.responses {
					if resp.FormID.Hex() == form.ID.Hex() {
						responseCount++
					}
				}
				form.ResponseCount = responseCount
				forms = append(forms, form)
			}
		}
	}
	
	return forms, nil
}

func (s *MemoryStore) UpdateForm(id string, updates map[string]interface{}) (*models.Form, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	form, exists := s.forms[id]
	if !exists {
		return nil, errors.New("form not found")
	}
	
	// Apply updates
	if title, ok := updates["title"].(string); ok {
		form.Title = title
	}
	if description, ok := updates["description"].(string); ok {
		form.Description = description
	}
	if fields, ok := updates["fields"].([]models.FormField); ok {
		form.Fields = fields
	}
	if status, ok := updates["status"].(string); ok {
		form.Status = status
		form.IsActive = (status == "published")
	}
	if isActive, ok := updates["isActive"].(bool); ok {
		form.IsActive = isActive
	}
	
	form.UpdatedAt = time.Now()
	return form, nil
}

func (s *MemoryStore) DeleteForm(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	if _, exists := s.forms[id]; !exists {
		return errors.New("form not found")
	}
	
	delete(s.forms, id)
	return nil
}

// Responses operations

func (s *MemoryStore) CreateResponse(response *models.FormResponse) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	response.ID = primitive.NewObjectID()
	response.CreatedAt = time.Now()
	
	s.responses[response.ID.Hex()] = response
	return nil
}

func (s *MemoryStore) GetResponsesByForm(formID string) ([]*models.FormResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var responses []*models.FormResponse
	for _, resp := range s.responses {
		if resp.FormID.Hex() == formID {
			responses = append(responses, resp)
		}
	}
	
	return responses, nil
}

func (s *MemoryStore) CountResponses(formID string, since time.Time) (int64, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	count := int64(0)
	for _, resp := range s.responses {
		if resp.FormID.Hex() == formID && resp.CreatedAt.After(since) {
			count++
		}
	}
	
	return count, nil
}

// Check if form is published
func (s *MemoryStore) IsFormPublished(formID string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	form, exists := s.forms[formID]
	if !exists {
		return false, errors.New("form not found")
	}
	
	return form.Status == "published" && form.IsActive, nil
}