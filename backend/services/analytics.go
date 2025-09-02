package services

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AnalyticsData represents analytics data for a form
type AnalyticsData struct {
	FormID          string                   `json:"formId"`
	TotalResponses  int64                    `json:"totalResponses"`
	TodayResponses  int64                    `json:"todayResponses"`
	WeekResponses   int64                    `json:"weekResponses"`
	MonthResponses  int64                    `json:"monthResponses"`
	CompletionRate  float64                  `json:"completionRate"`
	AverageTime     float64                  `json:"averageTime"`
	DeviceStats     map[string]int64         `json:"deviceStats"`
	FieldAnalytics  map[string]FieldStats    `json:"fieldAnalytics"`
	ResponseTrends  []TrendPoint             `json:"responseTrends"`
	RecentResponses []ResponseSummary        `json:"recentResponses"`
	LastUpdated     time.Time                `json:"lastUpdated"`
	PeakHour        int                      `json:"peakHour"`
	TopReferrer     string                   `json:"topReferrer"`
}

// FieldStats represents statistics for a form field
type FieldStats struct {
	FieldID        string                 `json:"fieldId"`
	FieldLabel     string                 `json:"fieldLabel"`
	ResponseCount  int64                  `json:"responseCount"`
	SkipCount      int64                  `json:"skipCount"`
	TopValues      map[string]int64       `json:"topValues"`
	AverageValue   float64                `json:"averageValue,omitempty"`
	Distribution   map[string]interface{} `json:"distribution,omitempty"`
}

// TrendPoint represents a point in the response trend
type TrendPoint struct {
	Time  time.Time `json:"time"`
	Count int64     `json:"count"`
	Label string    `json:"label"`
}

// ResponseSummary represents a summary of a response
type ResponseSummary struct {
	ID           string                 `json:"id"`
	SubmittedAt  time.Time              `json:"submittedAt"`
	Device       string                 `json:"device"`
	Location     string                 `json:"location"`
	ResponseData map[string]interface{} `json:"responseData"`
}

// AnalyticsService handles analytics operations
type AnalyticsService struct {
	db *mongo.Database
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(db *mongo.Database) *AnalyticsService {
	return &AnalyticsService{db: db}
}

// GetFormAnalytics retrieves analytics data for a form
func (s *AnalyticsService) GetFormAnalytics(formID string) (*AnalyticsData, error) {
	objID, err := primitive.ObjectIDFromHex(formID)
	if err != nil {
		return nil, err
	}

	ctx := context.Background()
	responsesCollection := s.db.Collection("responses")
	
	// Get total responses
	totalResponses, err := responsesCollection.CountDocuments(ctx, bson.M{"formId": objID})
	if err != nil {
		log.Printf("Error counting total responses: %v", err)
		return nil, err
	}

	// Get today's responses
	todayStart := time.Now().Truncate(24 * time.Hour)
	todayResponses, err := responsesCollection.CountDocuments(ctx, bson.M{
		"formId":    objID,
		"createdAt": bson.M{"$gte": todayStart},
	})
	if err != nil {
		log.Printf("Error counting today's responses: %v", err)
	}

	// Get week's responses
	weekStart := time.Now().AddDate(0, 0, -7)
	weekResponses, err := responsesCollection.CountDocuments(ctx, bson.M{
		"formId":    objID,
		"createdAt": bson.M{"$gte": weekStart},
	})
	if err != nil {
		log.Printf("Error counting week's responses: %v", err)
	}

	// Get month's responses
	monthStart := time.Now().AddDate(0, -1, 0)
	monthResponses, err := responsesCollection.CountDocuments(ctx, bson.M{
		"formId":    objID,
		"createdAt": bson.M{"$gte": monthStart},
	})
	if err != nil {
		log.Printf("Error counting month's responses: %v", err)
	}

	// Get response trends (last 7 days, hourly for today, daily for the rest)
	trends := s.getResponseTrends(ctx, responsesCollection, objID)

	// Get recent responses
	recentResponses := s.getRecentResponses(ctx, responsesCollection, objID, 10)

	// Get device statistics
	deviceStats := s.getDeviceStats(ctx, responsesCollection, objID)

	// Get field analytics
	fieldAnalytics := s.getFieldAnalytics(ctx, responsesCollection, objID)

	// Calculate completion rate and average time
	log.Printf("DEBUG: Starting analytics calculation for form %s", formID)
	
	// Debug: Check what responses exist
	totalResponsesInDB, _ := responsesCollection.CountDocuments(ctx, bson.M{"formId": objID})
	log.Printf("DEBUG: Total responses in DB: %d", totalResponsesInDB)
	
	// Debug: Check responses with session data
	responsesWithSessions, _ := responsesCollection.CountDocuments(ctx, bson.M{
		"formId": objID,
		"sessionId": bson.M{"$exists": true, "$ne": ""},
	})
	log.Printf("DEBUG: Responses with session data: %d", responsesWithSessions)
	
	// Debug: Check responses with completion time
	responsesWithTime, _ := responsesCollection.CountDocuments(ctx, bson.M{
		"formId": objID,
		"completionTime": bson.M{"$exists": true, "$ne": nil},
	})
	log.Printf("DEBUG: Responses with completion time: %d", responsesWithTime)
	
	// Debug: Check responses with isComplete field
	responsesWithComplete, _ := responsesCollection.CountDocuments(ctx, bson.M{
		"formId": objID,
		"isComplete": bson.M{"$exists": true},
	})
	log.Printf("DEBUG: Responses with isComplete field: %d", responsesWithComplete)
	
	// Debug: Check responses marked as complete
	completedResponsesDebug, _ := responsesCollection.CountDocuments(ctx, bson.M{
		"formId": objID,
		"isComplete": true,
	})
	log.Printf("DEBUG: Responses marked as complete: %d", completedResponsesDebug)
	
	// Migration: Update existing responses to have isComplete = true if they don't have the field
	if responsesWithComplete < totalResponsesInDB {
		log.Printf("DEBUG: Migrating %d responses to add isComplete field", totalResponsesInDB - responsesWithComplete)
		updateResult, err := responsesCollection.UpdateMany(
			ctx,
			bson.M{
				"formId": objID,
				"isComplete": bson.M{"$exists": false},
			},
			bson.M{"$set": bson.M{"isComplete": true}},
		)
		if err != nil {
			log.Printf("DEBUG: Error updating responses: %v", err)
		} else {
			log.Printf("DEBUG: Updated %d responses with isComplete field", updateResult.ModifiedCount)
		}
	}
	
	completionRate := s.calculateCompletionRate(ctx, responsesCollection, objID)
	log.Printf("DEBUG: Got completion rate: %.2f%%", completionRate)
	averageTime := s.calculateAverageTime(ctx, responsesCollection, objID)
	log.Printf("DEBUG: Got average time: %.2f seconds", averageTime)

	// Get peak hour
	peakHour := s.getPeakHour(ctx, responsesCollection, objID)

	analytics := &AnalyticsData{
		FormID:          formID,
		TotalResponses:  totalResponses,
		TodayResponses:  todayResponses,
		WeekResponses:   weekResponses,
		MonthResponses:  monthResponses,
		CompletionRate:  completionRate,
		AverageTime:     averageTime,
		DeviceStats:     deviceStats,
		FieldAnalytics:  fieldAnalytics,
		ResponseTrends:  trends,
		RecentResponses: recentResponses,
		LastUpdated:     time.Now(),
		PeakHour:        peakHour,
		TopReferrer:     "Direct",
	}

	return analytics, nil
}

// getResponseTrends gets the response trends for the last 7 days
func (s *AnalyticsService) getResponseTrends(ctx context.Context, collection *mongo.Collection, formID primitive.ObjectID) []TrendPoint {
	trends := []TrendPoint{}
	now := time.Now()

	// For today, get hourly trends
	todayStart := now.Truncate(24 * time.Hour)
	for hour := 0; hour <= now.Hour(); hour++ {
		hourStart := todayStart.Add(time.Duration(hour) * time.Hour)
		hourEnd := hourStart.Add(time.Hour)
		
		count, _ := collection.CountDocuments(ctx, bson.M{
			"formId":    formID,
			"createdAt": bson.M{
				"$gte": hourStart,
				"$lt":  hourEnd,
			},
		})
		
		trends = append(trends, TrendPoint{
			Time:  hourStart,
			Count: count,
			Label: hourStart.Format("3:04 PM"),
		})
	}

	// For the last 6 days, get daily trends
	for days := 1; days < 7; days++ {
		dayStart := now.AddDate(0, 0, -days).Truncate(24 * time.Hour)
		dayEnd := dayStart.Add(24 * time.Hour)
		
		count, _ := collection.CountDocuments(ctx, bson.M{
			"formId":    formID,
			"createdAt": bson.M{
				"$gte": dayStart,
				"$lt":  dayEnd,
			},
		})
		
		trends = append([]TrendPoint{{
			Time:  dayStart,
			Count: count,
			Label: dayStart.Format("Jan 2"),
		}}, trends...)
	}

	return trends
}

// getRecentResponses gets the most recent responses
func (s *AnalyticsService) getRecentResponses(ctx context.Context, collection *mongo.Collection, formID primitive.ObjectID, limit int) []ResponseSummary {
	cursor, err := collection.Find(ctx, bson.M{"formId": formID},
		options.Find().
			SetSort(bson.D{{Key: "createdAt", Value: -1}}).
			SetLimit(int64(limit)))
	if err != nil {
		log.Printf("Error getting recent responses: %v", err)
		return []ResponseSummary{}
	}
	defer cursor.Close(ctx)

	var responses []ResponseSummary
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			continue
		}

		// Parse device from user agent
		device := "Desktop"
		if userAgent, ok := doc["userAgent"].(string); ok {
			if containsAny(userAgent, []string{"Mobile", "Android", "iPhone"}) {
				device = "Mobile"
			} else if containsAny(userAgent, []string{"Tablet", "iPad"}) {
				device = "Tablet"
			}
		}

		responseData := make(map[string]interface{})
		if data, ok := doc["data"].(bson.M); ok {
			for k, v := range data {
				responseData[k] = v
			}
		}

		summary := ResponseSummary{
			ID:           doc["_id"].(primitive.ObjectID).Hex(),
			SubmittedAt:  doc["createdAt"].(primitive.DateTime).Time(),
			Device:       device,
			Location:     "Unknown", // You might want to implement IP geolocation
			ResponseData: responseData,
		}
		responses = append(responses, summary)
	}

	return responses
}

// getDeviceStats gets device statistics
func (s *AnalyticsService) getDeviceStats(ctx context.Context, collection *mongo.Collection, formID primitive.ObjectID) map[string]int64 {
	stats := map[string]int64{
		"Desktop": 0,
		"Mobile":  0,
		"Tablet":  0,
		"Other":   0,
	}

	cursor, err := collection.Find(ctx, bson.M{"formId": formID})
	if err != nil {
		log.Printf("Error getting device stats: %v", err)
		return stats
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			continue
		}

		device := "Other"
		if userAgent, ok := doc["userAgent"].(string); ok {
			if containsAny(userAgent, []string{"Mobile", "Android", "iPhone"}) {
				device = "Mobile"
			} else if containsAny(userAgent, []string{"Tablet", "iPad"}) {
				device = "Tablet"
			} else if userAgent != "" {
				device = "Desktop"
			}
		}
		stats[device]++
	}

	return stats
}

// getFieldAnalytics gets analytics for each field
func (s *AnalyticsService) getFieldAnalytics(ctx context.Context, collection *mongo.Collection, formID primitive.ObjectID) map[string]FieldStats {
	fieldStats := make(map[string]FieldStats)

	// Get the form to get field information
	formsCollection := s.db.Collection("forms")
	var form bson.M
	err := formsCollection.FindOne(ctx, bson.M{"_id": formID}).Decode(&form)
	if err != nil {
		log.Printf("Error getting form for field analytics: %v", err)
		return fieldStats
	}

	fields, ok := form["fields"].(primitive.A)
	if !ok {
		return fieldStats
	}

	// Initialize field stats
	for _, f := range fields {
		field, ok := f.(bson.M)
		if !ok {
			continue
		}
		
		fieldID, _ := field["id"].(string)
		fieldLabel, _ := field["label"].(string)
		
		fieldStats[fieldID] = FieldStats{
			FieldID:       fieldID,
			FieldLabel:    fieldLabel,
			ResponseCount: 0,
			SkipCount:     0,
			TopValues:     make(map[string]int64),
		}
	}

	// Analyze responses
	cursor, err := collection.Find(ctx, bson.M{"formId": formID})
	if err != nil {
		log.Printf("Error analyzing field responses: %v", err)
		return fieldStats
	}
	defer cursor.Close(ctx)

	totalResponses := int64(0)
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			continue
		}
		totalResponses++

		data, ok := doc["data"].(bson.M)
		if !ok {
			continue
		}

		// Update field stats
		for fieldID, stats := range fieldStats {
			if value, exists := data[fieldID]; exists && value != nil && value != "" {
				stats.ResponseCount++
				
				// Track top values (for select, radio, checkbox fields)
				valueStr := toString(value)
				if valueStr != "" {
					if stats.TopValues[valueStr] == 0 {
						stats.TopValues[valueStr] = 0
					}
					stats.TopValues[valueStr]++
				}
			} else {
				stats.SkipCount++
			}
			fieldStats[fieldID] = stats
		}
	}

	return fieldStats
}

// getPeakHour gets the hour with most responses
func (s *AnalyticsService) getPeakHour(ctx context.Context, collection *mongo.Collection, formID primitive.ObjectID) int {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"formId": formID}}},
		{{Key: "$group", Value: bson.M{
			"_id":   bson.M{"$hour": "$createdAt"},
			"count": bson.M{"$sum": 1},
		}}},
		{{Key: "$sort", Value: bson.M{"count": -1}}},
		{{Key: "$limit", Value: 1}},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Error getting peak hour: %v", err)
		return 14 // Default to 2 PM
	}
	defer cursor.Close(ctx)

	var result bson.M
	if cursor.Next(ctx) {
		if err := cursor.Decode(&result); err == nil {
			if hour, ok := result["_id"].(int32); ok {
				return int(hour)
			}
		}
	}

	return 14 // Default to 2 PM
}

// calculateCompletionRate calculates the actual completion rate
func (s *AnalyticsService) calculateCompletionRate(ctx context.Context, collection *mongo.Collection, formID primitive.ObjectID) float64 {
	log.Printf("DEBUG: Calculating completion rate for form %s", formID.Hex())
	
	// Count total unique sessions (started forms)
	sessionsCollection := s.db.Collection("sessions")
	totalSessions, err := sessionsCollection.CountDocuments(ctx, bson.M{"formId": formID})
	if err != nil {
		log.Printf("DEBUG: Error counting total sessions: %v", err)
		totalSessions = 0
	}
	log.Printf("DEBUG: Total sessions: %d", totalSessions)

	// Count completed responses
	completedResponses, err := collection.CountDocuments(ctx, bson.M{
		"formId":     formID,
		"isComplete": true,
	})
	if err != nil {
		log.Printf("DEBUG: Error counting completed responses: %v", err)
		return 100.0
	}
	log.Printf("DEBUG: Completed responses: %d", completedResponses)

	// If we have no session tracking data, estimate based on responses
	if totalSessions == 0 {
		// For forms without session tracking, assume 100% completion rate for existing responses
		log.Printf("DEBUG: No sessions found, assuming existing responses represent 100%% completion rate")
		return 100.0
	}

	// Calculate completion rate: responses / unique sessions
	// Cap at 100% to handle edge cases where tracking might be inconsistent
	if totalSessions > 0 {
		rate := (float64(completedResponses) / float64(totalSessions)) * 100.0
		if rate > 100.0 {
			log.Printf("DEBUG: Rate exceeds 100%% (%d/%d), capping at 100%%", completedResponses, totalSessions)
			rate = 100.0
		}
		log.Printf("DEBUG: Completion rate: %.2f%% (%d/%d)", rate, completedResponses, totalSessions)
		return rate
	}

	log.Printf("DEBUG: Returning 0%% completion rate")
	return 0.0
}

// calculateAverageTime calculates the actual average completion time
func (s *AnalyticsService) calculateAverageTime(ctx context.Context, collection *mongo.Collection, formID primitive.ObjectID) float64 {
	log.Printf("DEBUG: Calculating average time for form %s", formID.Hex())
	
	// Get all completed responses with completion times
	cursor, err := collection.Find(ctx, bson.M{
		"formId":         formID,
		"isComplete":     true,
		"completionTime": bson.M{"$exists": true, "$ne": nil},
	})
	if err != nil {
		log.Printf("DEBUG: Error getting completion times: %v", err)
		return 120.0 // Default 2 minutes
	}
	defer cursor.Close(ctx)

	var totalTime float64
	var count int

	log.Printf("DEBUG: Searching for responses with completion times...")
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("DEBUG: Error decoding document: %v", err)
			continue
		}

		if completionTime, ok := doc["completionTime"].(float64); ok {
			log.Printf("DEBUG: Found completion time: %.2f seconds", completionTime)
			totalTime += completionTime
			count++
		} else {
			log.Printf("DEBUG: Document missing completionTime or wrong type: %+v", doc["completionTime"])
		}
	}

	log.Printf("DEBUG: Found %d responses with completion times, total time: %.2f", count, totalTime)
	if count > 0 {
		avgTime := totalTime / float64(count)
		log.Printf("DEBUG: Calculated average time: %.2f seconds", avgTime)
		return avgTime
	}

	// Fallback: try to calculate from startedAt and createdAt
	log.Printf("DEBUG: No completion times found, trying fallback with startedAt/createdAt")
	cursor, err = collection.Find(ctx, bson.M{
		"formId":    formID,
		"startedAt": bson.M{"$exists": true, "$ne": nil},
	})
	if err != nil {
		log.Printf("DEBUG: Fallback query failed: %v", err)
		return 120.0 // Default 2 minutes
	}
	defer cursor.Close(ctx)

	totalTime = 0
	count = 0

	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("DEBUG: Error decoding fallback document: %v", err)
			continue
		}

		startedAt, startOk := doc["startedAt"].(primitive.DateTime)
		createdAt, endOk := doc["createdAt"].(primitive.DateTime)

		log.Printf("DEBUG: Checking document - startOk: %v, endOk: %v", startOk, endOk)
		if startOk && endOk {
			duration := createdAt.Time().Sub(startedAt.Time()).Seconds()
			log.Printf("DEBUG: Calculated duration: %.2f seconds", duration)
			if duration > 0 && duration < 3600 { // Ignore unrealistic times (> 1 hour)
				totalTime += duration
				count++
				log.Printf("DEBUG: Added to average - count: %d, totalTime: %.2f", count, totalTime)
			}
		}
	}

	log.Printf("DEBUG: Fallback calculation - count: %d, totalTime: %.2f", count, totalTime)
	if count > 0 {
		avgTime := totalTime / float64(count)
		log.Printf("DEBUG: Fallback average time: %.2f seconds", avgTime)
		return avgTime
	}

	// Last resort: estimate based on form complexity for existing responses
	totalResponsesWithoutTime, _ := collection.CountDocuments(ctx, bson.M{
		"formId": formID,
		"isComplete": true,
		"completionTime": bson.M{"$exists": false},
	})
	
	if totalResponsesWithoutTime > 0 {
		log.Printf("DEBUG: Found %d responses without timing data, using estimated average", totalResponsesWithoutTime)
		// Estimate: 30 seconds base + 15 seconds per field (reasonable for signature forms)
		estimatedTime := 30.0 + (float64(5) * 15.0) // Assuming ~5 fields average
		log.Printf("DEBUG: Using estimated time: %.2f seconds", estimatedTime)
		return estimatedTime
	}

	log.Printf("DEBUG: No data found, returning default 120 seconds")
	return 120.0 // Default 2 minutes
}

// Helper functions
func containsAny(str string, substrings []string) bool {
	for _, substr := range substrings {
		if contains(str, substr) {
			return true
		}
	}
	return false
}

func contains(str, substr string) bool {
	return len(str) >= len(substr) && str[:len(substr)] == substr || 
		   len(str) >= len(substr) && contains(str[1:], substr)
}

func toString(v interface{}) string {
	switch val := v.(type) {
	case string:
		return val
	case int, int32, int64, float32, float64:
		return ""  // Don't convert numbers to strings for top values
	case bool:
		if val {
			return "true"
		}
		return "false"
	default:
		return ""
	}
}

