package main

import (
	"context"
	"log"
	"os"
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
)

var client *mongo.Client
var database *mongo.Database

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to MongoDB
	connectMongoDB()

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
		})
	})

	// Forms routes
	forms := api.Group("/forms")
	forms.Post("/", createForm)
	forms.Get("/", getForms)
	forms.Get("/:id", getForm)
	forms.Put("/:id", updateForm)
	forms.Delete("/:id", deleteForm)
	forms.Post("/:id/save-draft", saveDraft)

	// Responses routes
	responses := api.Group("/responses")
	responses.Post("/", createResponse)
	responses.Get("/form/:formId", getResponsesByForm)
	responses.Get("/:id", getResponse)

	// Analytics routes
	analytics := api.Group("/analytics")
	analytics.Get("/form/:formId", getFormAnalytics)
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
	return c.JSON(fiber.Map{"message": "Create response endpoint"})
}

func getResponsesByForm(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Get responses by form endpoint"})
}

func getResponse(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Get response endpoint"})
}

func getFormAnalytics(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Get form analytics endpoint"})
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

	// Force status to draft
	draftStatus := "draft"
	req.Status = &draftStatus
	isActiveStatus := false
	req.IsActive = &isActiveStatus

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
			"status":    "draft",
			"isActive":  false,
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

	collection := database.Collection("forms")
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