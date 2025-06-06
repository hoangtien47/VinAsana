# VinAsana - Project Management Platform

VinAsana is a modern project management platform built with React, TypeScript, and Node.js. It features real-time WebSocket notifications, comprehensive task management, document handling, team collaboration, and analytics.

## 🚀 Features

- **Project Management**: Create and manage projects with comprehensive tracking
- **Task Management**: Kanban board, task assignment, deadlines, and priorities
- **Real-time Notifications**: WebSocket-based notifications for task deadlines
- **Document Management**: Upload, view, and manage project documents
- **Team Collaboration**: User management and team member assignment
- **Analytics**: Project insights and performance metrics
- **Authentication**: Secure Auth0 integration
- **Multi-language Support**: Internationalization support
- **Dark/Light Theme**: Customizable appearance

## 🏗️ Project Structure

```
VinAsana/
├── 📁 client/                          # Frontend React application
│   ├── index.html
│   └── src/
│       ├── App.tsx                     # Main application component
│       ├── main.tsx                    # Application entry point
│       ├── index.css                   # Global styles
│       ├── 📁 components/              # Reusable UI components
│       │   ├── analytics/              # Analytics dashboard components
│       │   ├── auth/                   # Authentication components
│       │   ├── dashboard/              # Dashboard components
│       │   ├── debug/                  # Debug utilities
│       │   ├── documents/              # Document management components
│       │   ├── projects/               # Project management components
│       │   ├── tasks/                  # Task management components
│       │   ├── team/                   # Team management components
│       │   └── ui/                     # Base UI components (buttons, inputs, etc.)
│       ├── 📁 hooks/                   # Custom React hooks
│       │   ├── use-auth.ts             # Authentication hook
│       │   ├── use-task.ts             # Task management hook
│       │   ├── use-project.ts          # Project management hook
│       │   ├── use-websocket-notifications.ts  # Real-time notifications
│       │   └── ...                     # Other utility hooks
│       ├── 📁 lib/                     # Utility libraries
│       │   ├── utils.ts                # Common utilities
│       │   ├── queryClient.ts          # React Query configuration
│       │   └── i18n.ts                 # Internationalization setup
│       └── 📁 pages/                   # Application pages
│           ├── dashboard.tsx           # Main dashboard
│           ├── tasks.tsx               # Task management page
│           ├── projects.tsx            # Project management page
│           ├── documents.tsx           # Document management page
│           ├── team.tsx                # Team management page
│           ├── analytics.tsx           # Analytics page
│           └── settings.tsx            # Application settings
├── 📁 shared/                          # Shared types and schemas
│   └── schema.ts                       # Database and API schemas
├── 📁 uploads/                         # File upload storage
├── 📁 volumes/                         # Docker volumes
│   ├── db/                             # PostgreSQL data
│   ├── cache/                          # Redis data
│   ├── rabbitmq/                       # RabbitMQ data
│   ├── grafana/                        # Grafana configuration
│   ├── loki/                           # Loki logs
│   └── prometheus/                     # Prometheus metrics
├── docker-compose.yml                  # Docker services configuration
├── package.json                        # Dependencies and scripts
├── vite.config.ts                      # Vite configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
└── tsconfig.json                       # TypeScript configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for API state management
- **React Hook Form** for form handling
- **Auth0** for authentication
- **WebSocket (STOMP)** for real-time notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript**
- **PostgreSQL** database
- **Redis** for caching
- **RabbitMQ** for message queuing
- **WebSocket (STOMP)** for real-time features

### Infrastructure
- **Docker & Docker Compose** for containerization
- **Grafana** for monitoring
- **Prometheus** for metrics
- **Loki** for log aggregation

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/VinAsana.git
cd VinAsana
```

### 2. Environment Setup

Create environment files for configuration:

```bash
# Copy example environment files
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://meikocn:meikocn@localhost:5432/meikocn"

# Auth0 Configuration
AUTH0_DOMAIN="your-auth0-domain"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81"

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"
```

### 3. Start Docker Services

```bash
# Start all services (PostgreSQL, Redis, RabbitMQ, Grafana, etc.)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 5. Database Setup

```bash
# Push database schema
npm run db:push
```

### 6. Start Development Servers

#### Option A: Start Both Frontend and Backend
```bash
# Start the development server (includes both frontend and backend)
npm run dev
```

#### Option B: Start Frontend Only
```bash
# Navigate to client directory and start frontend only
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:4040 (or next available port)
- **Backend API**: http://localhost:8080
- **WebSocket**: ws://localhost:8080/stomp

## 📊 Monitoring & Services

After starting Docker services, access the monitoring tools:

- **Grafana**: http://localhost:3000 (admin/admin)
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes to database

# Type Checking
npm run check           # Run TypeScript type checking
```

## 📱 Key Features Usage

### Real-time Notifications
- The application uses WebSocket connections for real-time task deadline notifications
- Notifications appear in the navbar bell icon
- Toast notifications show for high-priority task deadlines

### Task Management
- Drag-and-drop Kanban board interface
- Task creation with deadlines, priorities, and assignments
- Status tracking: TODO, IN_PROGRESS, IN_REVIEW, DONE

### Document Management
- Upload and manage project documents
- Document viewer with editing capabilities
- Project-specific document organization

### Team Collaboration
- User management and role assignment
- Project member assignment
- Permission-based access control

## 🐳 Docker Services

The application uses the following Docker services:

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| PostgreSQL | meikocn-postgresql | 5432 | Primary database |
| Redis | meikocn-redis | 6379 | Caching & sessions |
| RabbitMQ | meikocn-rabbitmq | 5672, 15672 | Message queue & management |
| Grafana | meikocn-grafana | 3000 | Monitoring dashboard |
| Prometheus | meikocn-prometheus | 9090 | Metrics collection |
| Loki | meikocn-loki | 3100 | Log aggregation |

## 🔒 Authentication

The application uses Auth0 for authentication. Configure your Auth0 application with:

- **Allowed Callback URLs**: `http://localhost:4040`
- **Allowed Logout URLs**: `http://localhost:4040`
- **Allowed Web Origins**: `http://localhost:4040`

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**: If ports are in use, Docker will automatically assign alternative ports
2. **Database Connection**: Ensure PostgreSQL container is running: `docker-compose ps`
3. **WebSocket Connection**: Check that backend is running on port 8080
4. **Auth0 Issues**: Verify Auth0 configuration and callback URLs

### Logs

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f db

# View all services logs
docker-compose logs -f
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting section above

---

**Happy coding! 🚀**
