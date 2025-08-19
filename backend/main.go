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
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	return c.JSON(fiber.Map{"message": "Create form endpoint"})
}

func getForms(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Get forms endpoint"})
}

func getForm(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Get form endpoint"})
}

func updateForm(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Update form endpoint"})
}

func deleteForm(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Delete form endpoint"})
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