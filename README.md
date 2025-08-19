# Form Builder Monorepo

A dynamic, customizable form builder application with real-time analytics, built with Next.js, Go Fiber, and MongoDB.

## Features

### 🎨 **Form Builder & Design**

- **Visual Form Builder**: Drag-and-drop interface for creating custom forms
- **Multiple Field Types**: Text, textarea, select dropdowns, radio buttons, checkboxes, and star ratings
- **Field Configuration**: Set required fields, placeholders, and validation rules
- **Real-time Preview**: See form changes instantly as you build
- **Form Templates**: Start with predefined form structures
- **Auto-save**: Automatic saving of form drafts every 2 seconds

### 📊 **Real-time Analytics Dashboard**

- **Live Response Tracking**: WebSocket-powered real-time updates
- **Interactive Charts**: Visualize response trends with animated charts
- **Response Analytics**: Track completion rates, average response times, and field performance
- **Device Analytics**: See which devices users are submitting from
- **Peak Hour Analysis**: Identify when forms receive the most responses
- **Export Data**: Download analytics data as JSON for further analysis
- **Real-time Notifications**: Get instant alerts when new responses arrive

### 🔄 **Form Management**

- **Form Lifecycle**: Draft → Published → Archived status management
- **Duplicate Forms**: Create copies of existing forms for quick iteration
- **Form Sharing**: Generate shareable links for published forms
- **Response Management**: View, filter, and manage form responses
- **Smart Navigation**: Context-aware routing (responses if they exist, builder if not)

### 📱 **User Experience**

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface built with TailwindCSS
- **Dark/Light Mode**: Theme support for user preferences
- **Accessibility**: WCAG compliant design with keyboard navigation
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: User-friendly error messages and validation

### 🚀 **Performance & Scalability**

- **High Performance API**: Go Fiber backend for sub-millisecond response times
- **WebSocket Integration**: Real-time updates without polling
- **MongoDB Storage**: Scalable NoSQL database for forms and responses
- **Optimized Queries**: Efficient database queries with proper indexing
- **Caching**: Smart caching strategies for improved performance

### 🔧 **Developer Experience**

- **TypeScript**: Full type safety across frontend and backend
- **Monorepo Structure**: Organized codebase with shared types
- **Hot Reloading**: Instant feedback during development
- **ESLint Integration**: Code quality and consistency
- **Docker Support**: Containerized development environment
- **Comprehensive API**: RESTful endpoints with proper error handling

### 📈 **Analytics & Insights**

- **Response Trends**: Time-based analysis of form submissions
- **Field Performance**: Track which fields are most/least completed
- **User Behavior**: Analyze how users interact with forms
- **Completion Rates**: Monitor form abandonment and success rates
- **Real-time Metrics**: Live counters and statistics
- **Data Visualization**: Charts, graphs, and visual representations

### 🔐 **Security & Validation**

- **Form Validation**: Client and server-side validation
- **Data Sanitization**: Protect against malicious input
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Type checking and format validation
- **Error Boundaries**: Graceful error handling throughout the app

### 🌐 **Deployment & DevOps**

- **Docker Support**: Containerized deployment
- **Environment Configuration**: Flexible environment variable management
- **Build Scripts**: Automated build and deployment processes
- **Development Scripts**: Convenient setup and development tools
- **Production Ready**: Optimized for production deployment

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **ESLint** - Code linting

### Backend

- **Go** - Programming language
- **Fiber v2** - Fast HTTP web framework
- **MongoDB** - NoSQL database
- **Docker** - Containerization for MongoDB

## Project Structure

```
form-builder-monorepo/
├── frontend/           # Next.js application
├── backend/           # Go Fiber API
├── shared/            # Shared types and utilities
├── docs/              # Documentation
├── scripts/           # Build and deployment scripts
└── package.json       # Monorepo configuration
```

## Quick Start

### Prerequisites

- Node.js 18+
- Go 1.21+
- Docker and Docker Compose

### 🚀 Easy Setup (Recommended)

We've provided convenient scripts to make setup and development a breeze:

1. **Clone the repository:**

```bash
git clone <repository-url>
cd form-builder-monorepo
```

2. **Run the setup script:**

```bash
./scripts/setup.sh
```

This script will:

- Check all prerequisites
- Install all dependencies (root, frontend, and Go)
- Create necessary environment files
- Set up the development environment

3. **Start development:**

```bash
./scripts/dev.sh
```

This script will:

- Start MongoDB if not running
- Launch both frontend and backend development servers

4. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### 🔧 Manual Setup (Alternative)

If you prefer to set up manually or need more control over the process:

1. **Clone the repository:**

```bash
git clone <repository-url>
cd form-builder-monorepo
```

2. **Install dependencies:**

```bash
npm run setup
```

3. **Start MongoDB:**

```bash
npm run start:db
```

4. **Start development servers:**

```bash
npm run dev
```

This will start:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Development

### Using Convenience Scripts (Recommended)

```bash
# Start development environment (includes MongoDB check)
./scripts/dev.sh

# Build for production
./scripts/build.sh
```

### Manual Development Commands

```bash
# Frontend development
npm run dev:frontend

# Backend development
npm run dev:backend

# Database Management
# Start MongoDB
npm run start:db

# Stop MongoDB
npm run stop:db
```

## API Endpoints

### Forms

- `POST /api/v1/forms` - Create a new form
- `GET /api/v1/forms` - Get all forms
- `GET /api/v1/forms/:id` - Get a specific form
- `PUT /api/v1/forms/:id` - Update a form
- `DELETE /api/v1/forms/:id` - Delete a form

### Responses

- `POST /api/v1/responses` - Submit a form response
- `GET /api/v1/responses/form/:formId` - Get responses for a form
- `GET /api/v1/responses/:id` - Get a specific response

### Analytics

- `GET /api/v1/analytics/form/:formId` - Get analytics for a form

## Environment Variables

### Backend (.env)

```
PORT=8080
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=formbuilder
```

## Building for Production

### Using the Build Script (Recommended)

```bash
./scripts/build.sh
```

### Manual Build

```bash
npm run build
```

## License

MIT License

## Challenges faced

When setting up the backend on my VPS, there were issues installing the dependencies, having to do with renaming node modules, so I used a shell script that finds half-renamed npm package folders, deletes both the temp dir and the real package, then reinstalls cleanly.
