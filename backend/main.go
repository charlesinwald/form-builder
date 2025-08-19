package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"regexp"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"form-builder-backend/models"
	"form-builder-backend/services"
	ws "form-builder-backend/websocket"
)

var client *mongo.Client
var database *mongo.Database
var wsHub *ws.Hub
var analyticsService *services.AnalyticsService
var useMemoryStore bool = false

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to MongoDB
	connectMongoDB()

	// Initialize services
	analyticsService = services.NewAnalyticsService(database)

	// Initialize WebSocket hub
	wsHub = ws.NewHub()
	go wsHub.Run()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		Prefork: false,
	})

	// Middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))
	app.Use(logger.New())

	// Routes
	setupRoutes(app)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("WebSocket hub started, ready for connections")
	log.Fatal(app.Listen(":" + port))
}

func connectMongoDB() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	database = client.Database("formbuilder")
	log.Println("Connected to MongoDB")
}

func setupRoutes(app *fiber.App) {
	api := app.Group("/api/v1")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Form Builder API is running",
			"wsClients": wsHub.GetConnectedClientsCount(),
		})
	})

	// WebSocket endpoint
	api.Get("/ws", ws.HandleWebSocket(wsHub))

	// Forms routes
	forms := api.Group("/forms")
	forms.Post("/", createForm)
	forms.Get("/", getForms)
	forms.Get("/:id", getForm)
	forms.Put("/:id", updateForm)
	forms.Delete("/:id", deleteForm)
	forms.Post("/:id/save-draft", saveDraft)
	forms.Post("/:id/unpublish", unpublishForm)
	
	// Public routes (no authentication required)
	public := api.Group("/public")
	public.Get("/forms/:id", getPublicForm)

	// Responses routes
	responses := api.Group("/responses")
	responses.Post("/", createResponse)
	responses.Get("/form/:formId", getResponsesByForm)
	responses.Get("/:id", getResponse)

	// Analytics routes
	analytics := api.Group("/analytics")
	analytics.Get("/form/:formId", getFormAnalytics)
	analytics.Get("/form/:formId/realtime", getRealTimeAnalytics)
}

func createForm(c *fiber.Ctx) error {
	var req models.CreateFormRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Title == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Title is required",
		})
	}

	if req.Status == "" {
		req.Status = "draft"
	}

	form := models.Form{
		Title:       req.Title,
		Description: req.Description,
		Fields:      req.Fields,
		Status:      req.Status,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		IsActive:    req.Status == "published",
		UserID:      "default", // TODO: implement user authentication
	}

	collection := database.Collection("forms")
	result, err := collection.InsertOne(context.Background(), form)
	if err != nil {
		log.Printf("Error creating form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create form",
		})
	}

	form.ID = result.InsertedID.(primitive.ObjectID)
	return c.Status(201).JSON(form)
}

func getForms(c *fiber.Ctx) error {
	collection := database.Collection("forms")
	
	// Get query parameters
	status := c.Query("status")
	userID := c.Query("userId", "default") // TODO: get from auth
	
	filter := bson.M{"userId": userID}
	if status != "" {
		filter["status"] = status
	}

	cursor, err := collection.Find(context.Background(), filter, options.Find().SetSort(bson.D{{Key: "updatedAt", Value: -1}}))
	if err != nil {
		log.Printf("Error fetching forms: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch forms",
		})
	}
	defer cursor.Close(context.Background())

	var forms []models.Form
	if err := cursor.All(context.Background(), &forms); err != nil {
		log.Printf("Error decoding forms: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to decode forms",
		})
	}

	if forms == nil {
		forms = []models.Form{}
	}

	// Get response counts for each form
	responsesCollection := database.Collection("responses")
	for i := range forms {
		count, err := responsesCollection.CountDocuments(
			context.Background(),
			bson.M{"formId": forms[i].ID},
		)
		if err != nil {
			log.Printf("Error counting responses for form %s: %v", forms[i].ID.Hex(), err)
			// Continue without response count rather than failing
		}
		// Add response count to form (we'll need to modify the model)
		forms[i].ResponseCount = int(count)
	}

	return c.JSON(forms)
}

func getForm(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	collection := database.Collection("forms")
	var form models.Form
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&form)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(404).JSON(fiber.Map{
				"error": "Form not found",
			})
		}
		log.Printf("Error fetching form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch form",
		})
	}

	return c.JSON(form)
}

func updateForm(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	var req models.UpdateFormRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	if req.Title != nil {
		update["$set"].(bson.M)["title"] = *req.Title
	}
	if req.Description != nil {
		update["$set"].(bson.M)["description"] = *req.Description
	}
	if req.Fields != nil {
		update["$set"].(bson.M)["fields"] = *req.Fields
	}
	if req.Status != nil {
		update["$set"].(bson.M)["status"] = *req.Status
		update["$set"].(bson.M)["isActive"] = (*req.Status == "published")
	}
	if req.IsActive != nil {
		update["$set"].(bson.M)["isActive"] = *req.IsActive
	}

	collection := database.Collection("forms")
	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		log.Printf("Error updating form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update form",
		})
	}

	if result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Form not found",
		})
	}

	// Fetch and return the updated form
	var updatedForm models.Form
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedForm)
	if err != nil {
		log.Printf("Error fetching updated form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Form updated but failed to fetch updated data",
		})
	}

	return c.JSON(updatedForm)
}

func deleteForm(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	collection := database.Collection("forms")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		log.Printf("Error deleting form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete form",
		})
	}

	if result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Form not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Form deleted successfully",
	})
}

func createResponse(c *fiber.Ctx) error {
	var req struct {
		FormID string                 `json:"formId" validate:"required"`
		Data   map[string]interface{} `json:"data" validate:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.FormID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Form ID is required",
		})
	}

	if req.Data == nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Form data is required",
		})
	}

	// Convert form ID to ObjectID
	formObjID, err := primitive.ObjectIDFromHex(req.FormID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	// Verify the form exists and is published
	formsCollection := database.Collection("forms")
	var form models.Form
	err = formsCollection.FindOne(context.Background(), bson.M{
		"_id":      formObjID,
		"status":   "published",
		"isActive": true,
	}).Decode(&form)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(404).JSON(fiber.Map{
				"error": "Form not found or not published",
			})
		}
		log.Printf("Error finding form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to verify form",
		})
	}

	// Validate form data against form fields
	if err := validateFormData(req.Data, form.Fields); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Create form response
	response := models.FormResponse{
		FormID:    formObjID,
		Data:      req.Data,
		CreatedAt: time.Now(),
		IPAddress: c.IP(),
		UserAgent: c.Get("User-Agent"),
	}

	// Insert response into database
	responsesCollection := database.Collection("responses")
	result, err := responsesCollection.InsertOne(context.Background(), response)
	if err != nil {
		log.Printf("Error creating response: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to save response",
		})
	}

	response.ID = result.InsertedID.(primitive.ObjectID)

	// Broadcast new response via WebSocket
	wsMessage := ws.Message{
		Type:      ws.MessageTypeNewResponse,
		Timestamp: time.Now(),
		FormID:    req.FormID,
		Data: fiber.Map{
			"id":          response.ID.Hex(),
			"formId":      req.FormID,
			"submittedAt": response.CreatedAt,
			"data":        req.Data,
			"device":      getDeviceFromUserAgent(response.UserAgent),
		},
	}
	wsHub.BroadcastToForm(req.FormID, wsMessage)

	// Also broadcast analytics update
	if analytics, err := analyticsService.GetFormAnalytics(req.FormID); err == nil {
		analyticsMessage := ws.Message{
			Type:      ws.MessageTypeAnalyticsUpdate,
			Timestamp: time.Now(),
			FormID:    req.FormID,
			Data:      analytics,
		}
		wsHub.BroadcastToForm(req.FormID, analyticsMessage)
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Response submitted successfully",
		"id":      response.ID.Hex(),
	})
}

func getDeviceFromUserAgent(userAgent string) string {
	if containsAny(userAgent, []string{"Mobile", "Android", "iPhone"}) {
		return "Mobile"
	} else if containsAny(userAgent, []string{"Tablet", "iPad"}) {
		return "Tablet"
	}
	return "Desktop"
}

func containsAny(str string, substrings []string) bool {
	for _, substr := range substrings {
		if contains(str, substr) {
			return true
		}
	}
	return false
}

func contains(str, substr string) bool {
	return len(str) >= len(substr) && (str[:len(substr)] == substr || 
		   (len(str) > len(substr) && contains(str[1:], substr)))
}

func validateFormData(data map[string]interface{}, fields []models.FormField) error {
	// Create a map of field IDs for quick lookup
	fieldMap := make(map[string]models.FormField)
	for _, field := range fields {
		fieldMap[field.ID] = field
	}

	// Check required fields
	for _, field := range fields {
		if field.Required {
			value, exists := data[field.ID]
			if !exists || value == nil || (fmt.Sprintf("%v", value) == "") {
				return fmt.Errorf("%s is required", field.Label)
			}
		}
	}

	// Validate field types and constraints
	for fieldID, value := range data {
		field, exists := fieldMap[fieldID]
		if !exists {
			continue // Skip unknown fields
		}

		if value == nil {
			continue // Skip empty optional fields
		}

		// Type-specific validation
		switch field.Type {
		case "email":
			if str, ok := value.(string); ok {
				if !isValidEmail(str) {
					return fmt.Errorf("%s must be a valid email address", field.Label)
				}
			}
		case "number":
			if _, ok := value.(float64); !ok {
				return fmt.Errorf("%s must be a number", field.Label)
			}
		}

		// Validation rules
		if field.Validation != nil {
			if err := validateFieldValue(value, field); err != nil {
				return fmt.Errorf("%s: %s", field.Label, err.Error())
			}
		}
	}

	return nil
}

func validateFieldValue(value interface{}, field models.FormField) error {
	validation := field.Validation

	if minVal, exists := validation["min"]; exists {
		min := int(minVal.(float64))
		
		switch v := value.(type) {
		case string:
			if len(v) < min {
				return fmt.Errorf("must be at least %d characters", min)
			}
		case float64:
			if int(v) < min {
				return fmt.Errorf("must be at least %d", min)
			}
		}
	}

	if maxVal, exists := validation["max"]; exists {
		max := int(maxVal.(float64))
		
		switch v := value.(type) {
		case string:
			if len(v) > max {
				return fmt.Errorf("must be no more than %d characters", max)
			}
		case float64:
			if int(v) > max {
				return fmt.Errorf("must be no more than %d", max)
			}
		}
	}

	if patternVal, exists := validation["pattern"]; exists {
		if str, ok := value.(string); ok {
			pattern := patternVal.(string)
			matched, err := regexp.MatchString(pattern, str)
			if err != nil {
				return fmt.Errorf("invalid pattern validation")
			}
			if !matched {
				if message, exists := validation["message"]; exists {
					return fmt.Errorf(message.(string))
				}
				return fmt.Errorf("format is invalid")
			}
		}
	}

	return nil
}

func isValidEmail(email string) bool {
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	matched, _ := regexp.MatchString(pattern, email)
	return matched
}

func getPublicForm(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	collection := database.Collection("forms")
	var form models.Form
	err = collection.FindOne(context.Background(), bson.M{
		"_id":      objID,
		"status":   "published",
		"isActive": true,
	}).Decode(&form)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(404).JSON(fiber.Map{
				"error": "Form not found or not published",
			})
		}
		log.Printf("Error fetching public form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch form",
		})
	}

	return c.JSON(form)
}

func getResponsesByForm(c *fiber.Ctx) error {
	formID := c.Params("formId")
	
	// Convert form ID to ObjectID
	formObjID, err := primitive.ObjectIDFromHex(formID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	// Verify the form exists and user has access
	formsCollection := database.Collection("forms")
	var form models.Form
	err = formsCollection.FindOne(context.Background(), bson.M{
		"_id":    formObjID,
		"userId": "default", // TODO: get from auth
	}).Decode(&form)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(404).JSON(fiber.Map{
				"error": "Form not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to verify form",
		})
	}

	// Get responses
	responsesCollection := database.Collection("responses")
	cursor, err := responsesCollection.Find(
		context.Background(), 
		bson.M{"formId": formObjID},
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}),
	)
	if err != nil {
		log.Printf("Error fetching responses: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch responses",
		})
	}
	defer cursor.Close(context.Background())

	var responses []models.FormResponse
	if err := cursor.All(context.Background(), &responses); err != nil {
		log.Printf("Error decoding responses: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to decode responses",
		})
	}

	if responses == nil {
		responses = []models.FormResponse{}
	}

	return c.JSON(responses)
}

func getResponse(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Get response endpoint"})
}

func getFormAnalytics(c *fiber.Ctx) error {
	formID := c.Params("formId")
	
	analytics, err := analyticsService.GetFormAnalytics(formID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get analytics",
		})
	}

	return c.JSON(analytics)
}

func getRealTimeAnalytics(c *fiber.Ctx) error {
	formID := c.Params("formId")
	
	// Get current analytics
	analytics, err := analyticsService.GetFormAnalytics(formID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get analytics",
		})
	}

	// Add WebSocket connection info
	return c.JSON(fiber.Map{
		"analytics":   analytics,
		"subscribers": wsHub.GetFormSubscribersCount(formID),
		"wsEndpoint":  "/api/v1/ws",
	})
}

func saveDraft(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	var req models.UpdateFormRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// First, get the current form to preserve its status
	collection := database.Collection("forms")
	var currentForm models.Form
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&currentForm)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(404).JSON(fiber.Map{
				"error": "Form not found",
			})
		}
		log.Printf("Error fetching current form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch form",
		})
	}

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	// Only update fields that are provided, preserve status and isActive
	if req.Title != nil {
		update["$set"].(bson.M)["title"] = *req.Title
	}
	if req.Description != nil {
		update["$set"].(bson.M)["description"] = *req.Description
	}
	if req.Fields != nil {
		update["$set"].(bson.M)["fields"] = *req.Fields
	}

	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		log.Printf("Error saving draft: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to save draft",
		})
	}

	if result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Form not found",
		})
	}

	// Fetch and return the updated form
	var updatedForm models.Form
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedForm)
	if err != nil {
		log.Printf("Error fetching updated draft: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Draft saved but failed to fetch updated data",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Draft saved successfully",
		"form":    updatedForm,
	})
}

func unpublishForm(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid form ID",
		})
	}

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
			"status":    "draft",
			"isActive":  false,
		},
	}

	collection := database.Collection("forms")
	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		log.Printf("Error unpublishing form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to unpublish form",
		})
	}

	if result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Form not found",
		})
	}

	// Fetch and return the updated form
	var updatedForm models.Form
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedForm)
	if err != nil {
		log.Printf("Error fetching unpublished form: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Form unpublished but failed to fetch updated data",
		})
	}

	return c.JSON(updatedForm)
}