# Real-Time Analytics Dashboard

## Overview

A fully functional real-time analytics dashboard built from scratch with WebSocket support for live data updates. The system provides instant feedback visualization without page reloading.

## ✨ Features

### Real-Time Capabilities
- **WebSocket Connection**: Bi-directional communication between frontend and backend
- **Live Updates**: Data appears on dashboard instantly as it's submitted
- **No Page Reloading**: All updates happen seamlessly in real-time
- **Auto-Reconnection**: Automatic reconnection with exponential backoff
- **Connection Status Indicator**: Visual indication of WebSocket connection state

### Analytics Features
- **Response Tracking**: Total, daily, weekly, and monthly response counts
- **Device Analytics**: Track responses by device type (Mobile, Desktop, Tablet)
- **Field Analytics**: Response rates and skip rates for each form field
- **Response Trends**: Hourly and daily trend visualization
- **Completion Rate**: Track form completion percentage
- **Peak Hour Analysis**: Identify most active submission times
- **Recent Responses**: Live feed of latest submissions

### Visualizations
- **Interactive Charts**: Built with Recharts
  - Area charts for response trends
  - Pie charts for device distribution
  - Bar charts for field analytics
  - Line charts for detailed trends
- **Animated Updates**: Smooth transitions with Framer Motion
- **Real-Time Notifications**: Toast notifications for new responses
- **Milestone Alerts**: Special notifications for response milestones

## 🏗️ Architecture

### Backend (Go + Fiber)
```
backend/
├── main.go                 # Main server with WebSocket integration
├── websocket/
│   ├── hub.go             # WebSocket hub for managing connections
│   └── client.go          # Client connection handler
├── services/
│   └── analytics.go       # Analytics data aggregation service
└── models/
    ├── form.go            # Form data model
    └── response.go        # Response data model
```

### Frontend (Next.js + React)
```
frontend/
├── src/
│   ├── lib/
│   │   └── websocket.ts   # WebSocket client implementation
│   ├── hooks/
│   │   └── use-websocket-analytics.ts  # React hook for real-time data
│   └── app/
│       └── components/
│           ├── real-time-analytics-dashboard.tsx  # Main dashboard
│           ├── real-time-notifications.tsx        # Notification system
│           └── analytics/
│               └── page.tsx                       # Demo page
```

## 🚀 Getting Started

### Prerequisites
- Go 1.19+
- Node.js 18+
- MongoDB (or Docker for MongoDB)

### Backend Setup

1. **Install MongoDB** (if not using Docker):
   ```bash
   # Using Docker
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   
   # Or install MongoDB locally
   # Follow instructions at https://docs.mongodb.com/manual/installation/
   ```

2. **Start the Backend Server**:
   ```bash
   cd backend
   
   # Install dependencies
   go mod download
   
   # Build
   go build -o main .
   
   # Run
   ./main
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

3. **Access the Analytics Dashboard**:
   Navigate to `http://localhost:3000/analytics`

## 📡 WebSocket Communication

### Connection Flow
1. Client connects to `/api/v1/ws` endpoint
2. Client subscribes to specific form channels
3. Server broadcasts updates to subscribed clients
4. Client receives real-time updates and updates UI

### Message Types
- `new_response`: New form submission notification
- `analytics_update`: Updated analytics data
- `heartbeat`: Keep-alive signal
- `subscribe/unsubscribe`: Channel management

### WebSocket Client Usage
```typescript
import { getWebSocketClient } from '@/lib/websocket';

const client = getWebSocketClient({
  onOpen: () => console.log('Connected'),
  onMessage: (message) => console.log('Message:', message)
});

client.connect();
client.subscribe('form-id');
```

## 🧪 Testing the Real-Time Features

### Demo Mode
The analytics page includes a simulation feature for testing:

1. Navigate to the analytics page
2. Click "Start Simulation" to begin automatic form submissions
3. Watch as responses appear in real-time
4. Observe chart animations and notifications

### Manual Testing
```bash
# Submit a test response
curl -X POST http://localhost:8080/api/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "6789c7f2e8b9a0d1e2f3a4b5",
    "data": {
      "name": "Test User",
      "email": "test@example.com",
      "feedback": "Great form!",
      "rating": 5
    }
  }'
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
MONGO_URI=mongodb://localhost:27017
PORT=8080
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/v1/ws
```

## 📊 API Endpoints

### WebSocket
- `GET /api/v1/ws` - WebSocket connection endpoint

### Analytics
- `GET /api/v1/analytics/form/:formId` - Get form analytics
- `GET /api/v1/analytics/form/:formId/realtime` - Get real-time analytics info

### Responses
- `POST /api/v1/responses` - Submit form response
- `GET /api/v1/responses/form/:formId` - Get form responses

## 🎨 UI Components

### Real-Time Analytics Dashboard
- Comprehensive analytics overview
- Multiple chart types with live updates
- Connection status indicator
- Export functionality

### Real-Time Notifications
- Toast notifications for new responses
- Milestone notifications
- Auto-dismiss with customizable duration
- Action buttons for quick actions

## 🚦 Connection States

- **CONNECTED**: ✅ Receiving live updates
- **CONNECTING**: 🔄 Establishing connection
- **DISCONNECTED**: ❌ No live updates
- **ERROR**: ⚠️ Connection failed

## 📈 Performance Optimizations

- **Debounced Updates**: Prevents UI thrashing
- **Batch Processing**: Groups multiple updates
- **Lazy Loading**: Charts load on demand
- **Memory Management**: Automatic cleanup of old data
- **Connection Pooling**: Efficient WebSocket management

## 🔍 Troubleshooting

### WebSocket Connection Issues
1. Check if backend is running on port 8080
2. Verify MongoDB is accessible
3. Check browser console for errors
4. Ensure CORS is properly configured

### No Real-Time Updates
1. Verify WebSocket connection status
2. Check if form ID is correct
3. Ensure client is subscribed to form channel
4. Check network tab for WebSocket frames

## 📝 Development Notes

### Adding New Analytics Metrics
1. Update `AnalyticsData` struct in backend
2. Add calculation in `GetFormAnalytics` function
3. Update frontend types in `use-websocket-analytics.ts`
4. Add visualization component

### Extending WebSocket Messages
1. Add new message type in `websocket/hub.go`
2. Handle message in `websocket/client.go`
3. Update frontend message handler
4. Add corresponding UI updates

## 🎯 Future Enhancements

- [ ] Add user authentication
- [ ] Implement data persistence for analytics
- [ ] Add export to CSV/PDF
- [ ] Implement custom date ranges
- [ ] Add more chart types (heatmaps, scatter plots)
- [ ] Add geographical analytics
- [ ] Implement alert thresholds
- [ ] Add A/B testing analytics
- [ ] Create mobile app with real-time sync

## 📄 License

MIT License - Feel free to use this project for learning and development.