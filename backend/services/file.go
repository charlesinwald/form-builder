package services

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"form-builder-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type FileService struct {
	db       *mongo.Database
	uploadDir string
	baseURL   string
}

func NewFileService(db *mongo.Database) *FileService {
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	baseURL := os.Getenv("FILE_BASE_URL")
	if baseURL == "" {
		baseURL = "http://127.0.0.1:8080"
	}

	// Ensure upload directory exists
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create upload directory: %v", err))
	}

	return &FileService{
		db:        db,
		uploadDir: uploadDir,
		baseURL:   baseURL,
	}
}

func (fs *FileService) UploadFile(file *multipart.FileHeader, userID string, formID string, fieldID string) (*models.FileUpload, error) {
	// Validate file type
	if !fs.isValidFileType(file.Header.Get("Content-Type")) {
		return nil, fmt.Errorf("invalid file type: %s", file.Header.Get("Content-Type"))
	}

	// Validate file size (10MB limit)
	const maxFileSize = 10 << 20 // 10MB
	if file.Size > maxFileSize {
		return nil, fmt.Errorf("file too large: %d bytes (max: %d bytes)", file.Size, maxFileSize)
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %v", err)
	}
	defer src.Close()

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s_%d%s", primitive.NewObjectID().Hex(), time.Now().Unix(), ext)

	// Create full path
	fullPath := filepath.Join(fs.uploadDir, filename)

	// Create destination file
	dst, err := os.Create(fullPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create destination file: %v", err)
	}
	defer dst.Close()

	// Copy file contents
	_, err = io.Copy(dst, src)
	if err != nil {
		os.Remove(fullPath) // Clean up on error
		return nil, fmt.Errorf("failed to copy file: %v", err)
	}

	// Generate public URL
	fileURL := fmt.Sprintf("%s/api/v1/public/files/%s", fs.baseURL, filename)

	// Create file record
	fileUpload := &models.FileUpload{
		ID:           primitive.NewObjectID(),
		Filename:     filename,
		OriginalName: file.Filename,
		MimeType:     file.Header.Get("Content-Type"),
		Size:         file.Size,
		Path:         fullPath,
		URL:          fileURL,
		UserID:       userID,
		FormID:       formID,
		FieldID:      fieldID,
		CreatedAt:    time.Now(),
	}

	// Save to database
	collection := fs.db.Collection("files")
	_, err = collection.InsertOne(context.Background(), fileUpload)
	if err != nil {
		os.Remove(fullPath) // Clean up on error
		return nil, fmt.Errorf("failed to save file record: %v", err)
	}

	return fileUpload, nil
}

func (fs *FileService) GetFile(filename string) (string, error) {
	// Validate filename to prevent path traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") {
		return "", fmt.Errorf("invalid filename")
	}

	fullPath := filepath.Join(fs.uploadDir, filename)

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return "", fmt.Errorf("file not found")
	}

	return fullPath, nil
}

func (fs *FileService) DeleteFile(fileID string, userID string) error {
	objID, err := primitive.ObjectIDFromHex(fileID)
	if err != nil {
		return fmt.Errorf("invalid file ID")
	}

	collection := fs.db.Collection("files")

	// Find the file record
	var file models.FileUpload
	err = collection.FindOne(context.Background(), bson.M{
		"_id":    objID,
		"userId": userID,
	}).Decode(&file)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return fmt.Errorf("file not found")
		}
		return fmt.Errorf("failed to find file: %v", err)
	}

	// Delete the physical file
	if err := os.Remove(file.Path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete physical file: %v", err)
	}

	// Delete the database record
	_, err = collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		return fmt.Errorf("failed to delete file record: %v", err)
	}

	return nil
}

func (fs *FileService) GetUserFiles(userID string) ([]models.FileUpload, error) {
	collection := fs.db.Collection("files")
	filter := bson.M{"userId": userID}
	
	// Add logging
	fmt.Printf("FileService.GetUserFiles: querying with filter: %+v\n", filter)
	
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user files: %v", err)
	}
	defer cursor.Close(context.Background())

	var files []models.FileUpload
	if err := cursor.All(context.Background(), &files); err != nil {
		return nil, fmt.Errorf("failed to decode files: %v", err)
	}

	fmt.Printf("FileService.GetUserFiles: found %d files for userID '%s'\n", len(files), userID)
	return files, nil
}

func (fs *FileService) isValidFileType(contentType string) bool {
	allowedTypes := map[string]bool{
		"image/jpeg":      true,
		"image/jpg":       true,
		"image/png":       true,
		"image/gif":       true,
		"image/webp":      true,
		"image/svg+xml":   true,
		"application/pdf": true,
		"text/plain":      true,
		"application/msword": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
		"application/vnd.ms-excel": true,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
	}

	return allowedTypes[contentType]
}