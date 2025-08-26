# Challenge V4 Backend API

🚀 **Backend API cho Challenge V4** - Express.js + TypeScript + Socket.IO + Firebase + Redis

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc](#-kiến-trúc)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🎯 Tổng quan

Backend API cung cấp các tính năng:

### 🔐 **Authentication & Authorization**

- Access code generation và validation cho Owner
- Employee login với email
- Rate limiting để bảo mật

### 💬 **Real-time Chat**

- WebSocket chat với Socket.IO
- Private & Group messaging
- Typing indicators
- User presence (online/offline)
- Message persistence

### 👥 **User Management**

- Owner management
- Employee CRUD operations
- Role-based access control

### 📱 **Communication**

- SMS service (Twilio integration)
- Email service
- Push notifications ready

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   WebSocket     │    │   HTTP Client   │
│                 │    │   Connection    │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                    Express.js Server                               │
├─────────────────────────────────┼─────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┼─────────────┐  ┌─────────────┐  │
│  │  HTTP API   │  │  WebSocket  │  Handlers   │  │ Middlewares │  │
│  │  Routes     │  │  Events     │             │  │             │  │
│  └─────────────┘  └─────────────┼─────────────┘  └─────────────┘  │
├─────────────────────────────────┼─────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┼─────────────┐  ┌─────────────┐  │
│  │Controllers  │  │  Services   │             │  │ Repositories│  │
│  │             │  │             │             │  │             │  │
│  └─────────────┘  └─────────────┼─────────────┘  └─────────────┘  │
└─────────────────────────────────┼─────────────────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                External Services                                  │
├─────────────────────────────────┼─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │ ┌─────────────┐ ┌─────────────┐ │
│ │  Firebase   │ │    Redis    │ │ │   Twilio    │ │    Email    │ │
│ │  Firestore  │ │   Cache     │ │ │    SMS      │ │   Service   │ │
│ └─────────────┘ └─────────────┘ │ └─────────────┘ └─────────────┘ │
└─────────────────────────────────┴─────────────────────────────────┘
```

### 🎨 **Design Patterns**

- **MVC Pattern**: Controller → Service → Repository
- **Dependency Injection**: Loose coupling giữa các modules
- **Repository Pattern**: Abstraction cho data access
- **Observer Pattern**: WebSocket events
- **Singleton Pattern**: Database connections, cache

## 🛠️ Công nghệ sử dụng

### **Core**

- **Node.js** 18+ - Runtime environment
- **TypeScript** 5.x - Type safety
- **Express.js** 4.x - Web framework
- **Socket.IO** 4.x - Real-time communication

### **Database & Cache**

- **Firebase Firestore** - NoSQL database
- **Redis** 7.x - In-memory cache & session store

### **Authentication & Security**

- **bcrypt** - Password hashing
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

### **Communication**

- **Twilio** - SMS service
- **Nodemailer** - Email service

### **Development**

- **ts-node-dev** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vitest** - Testing framework

### **Documentation**

- **Swagger/OpenAPI** - API documentation
- **Pino** - Structured logging

## 🚀 Cài đặt

### **Yêu cầu hệ thống**

- Node.js 18+
- Docker & Docker Compose (optional)
- Redis (nếu không dùng Docker)

### **1. Clone repository**

```bash
git clone https://github.com/thphan1408/challenge_v4.git
cd challenge_v4/backend
```

### **2. Install dependencies**

```bash
npm install
```

### **3. Setup Firebase**

1. Tạo project trên [Firebase Console](https://console.firebase.google.com/)
2. Tạo Firestore database
3. Tạo Service Account và download `serviceAccount.json`
4. Copy file vào root directory

### **4. Setup environment variables**

```bash
cp .env.example .env
```

## ⚙️ Cấu hình

### **Environment Variables (.env)**

```bash
# Server Configuration
NODE_ENV=development
PORT=8080
LOG_LEVEL=info

# CORS Configuration
CORS_WHITELIST=http://localhost:3000,http://localhost:8080

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Email Configuration
EMAIL_SERVICE=mock
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **Firebase Setup**

```json
// serviceAccount.json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "..."
}
```

## 🏃‍♂️ Chạy ứng dụng

### **Development với Docker (Recommended)**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

### **Development không Docker**

```bash
# Start Redis
redis-server

# Start development server
npm run dev
```

### **Production**

```bash
# Build application
npm run build

# Start production server
npm start
```

### **With Redis Admin UI**

```bash
# Start with Redis Commander UI
docker-compose --profile tools up -d

# Access Redis UI at http://localhost:8081
```

## 📚 API Documentation

### **Swagger UI**

Truy cập API documentation tại: http://localhost:8080/api-docs

### **Main Endpoints**

#### **🔐 Owner Authentication**

```http
POST /api/owners/create-access-code
POST /api/owners/validate-access-code
```

#### **👥 Employee Management**

```http
POST /api/employees/login-email
GET /api/employees
POST /api/employees
DELETE /api/employees/:id
```

#### **💬 Chat Management**

```http
GET /api/chat/rooms/:userId
GET /api/chat/rooms/:roomId/messages
POST /api/chat/rooms
POST /api/chat/rooms/:roomId/users
DELETE /api/chat/rooms/:roomId/users
GET /api/chat/users/active
POST /api/chat/messages/direct
```

#### **🏥 Health Check**

```http
GET /health
```

### **Example Requests**

#### **Create Access Code**

```bash
curl -X POST http://localhost:8080/api/owners/create-access-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+84901234567"}'
```

#### **Validate Access Code**

```bash
curl -X POST http://localhost:8080/api/owners/validate-access-code \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+84901234567",
    "accessCode": "123456"
  }'
```

## 🔌 WebSocket Events

### **Client → Server Events**

#### **Authentication**

```javascript
socket.emit('user:join', {
  userId: 'user123',
  userRole: 'owner', // 'owner' | 'employee'
  userName: 'John Doe',
});
```

#### **Messaging**

```javascript
// Send message
socket.emit('message:send', {
  senderId: 'user123',
  senderName: 'John Doe',
  senderRole: 'owner',
  recipientId: 'user456', // Optional for private message
  roomId: 'room123', // Optional for room message
  content: 'Hello World!',
  type: 'text', // 'text' | 'image' | 'file'
});

// Mark message as read
socket.emit('message:read', messageId);
```

#### **Room Management**

```javascript
// Join room
socket.emit('room:join', roomId);

// Leave room
socket.emit('room:leave', roomId);
```

#### **Typing Indicators**

```javascript
// Start typing
socket.emit('typing:start', roomId);

// Stop typing
socket.emit('typing:stop', roomId);
```

### **Server → Client Events**

#### **Message Events**

```javascript
// New message received
socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Message delivery confirmation
socket.on('message:delivered', (messageId) => {
  console.log('Message delivered:', messageId);
});
```

#### **User Status**

```javascript
socket.on('user:status', (status) => {
  console.log('User status:', status);
  // { userId, status: 'online|offline|away', lastSeen }
});
```

#### **Typing Events**

```javascript
socket.on('typing:user', (data) => {
  console.log(data.userName + ' is typing...');
});

socket.on('typing:stop', (data) => {
  console.log(data.userId + ' stopped typing');
});
```

#### **Error Handling**

```javascript
socket.on('error:chat', (error) => {
  console.error('Chat error:', error.message);
  // { message: string, code: string }
});
```

### **WebSocket Test Client**

Mở file `websocket-test.html` trong browser để test WebSocket functionality.

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── configs/           # Configuration files
│   │   ├── env.config.ts
│   │   ├── firebase.config.ts
│   │   ├── rateLimit.config.ts
│   │   ├── swagger.config.ts
│   │   └── websocket.config.ts
│   ├── controllers/       # HTTP request handlers
│   │   ├── base.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── employee.controller.ts
│   │   └── owner.controller.ts
│   ├── database/
│   │   ├── entities/      # Data models
│   │   │   ├── access-code.entity.ts
│   │   │   ├── base.entity.ts
│   │   │   ├── employee.entity.ts
│   │   │   └── owner.entity.ts
│   │   └── repositories/  # Data access layer
│   │       ├── base.repository.ts
│   │       ├── employee.repository.ts
│   │       └── owner.repository.ts
│   ├── dto/              # Data transfer objects
│   │   ├── employee/
│   │   │   └── employee.dto.ts
│   │   └── owner/
│   │       └── owner.dto.ts
│   ├── handlers/         # WebSocket event handlers
│   │   └── websocket.handler.ts
│   ├── libs/             # Utility libraries
│   │   ├── http.lib.ts
│   │   └── logger.lib.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── error.middleware.ts
│   │   ├── requestId.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/           # API route definitions
│   │   ├── chat.routes.ts
│   │   ├── employee.routes.ts
│   │   ├── owner.routes.ts
│   │   └── root.routes.ts
│   ├── services/         # Business logic layer
│   │   ├── cache.service.ts
│   │   ├── chat.service.ts
│   │   ├── email.service.ts
│   │   ├── employee.service.ts
│   │   ├── owner.service.ts
│   │   └── sms.service.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── api.type.ts
│   │   └── websocket.types.ts
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server entry point
├── docker-compose.yaml   # Docker compose configuration
├── Dockerfile           # Docker image definition
├── .dockerignore        # Docker ignore file
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── serviceAccount.json  # Firebase credentials
├── websocket-test.html  # WebSocket test client
└── README.md           # This file
```

## 🐳 Deployment

### **Docker Production**

```bash
# Build production image
docker build -t challenge-v4-backend:latest .

# Run production container
docker run -d \
  --name challenge-v4-backend \
  -p 8080:8080 \
  --env-file .env \
  challenge-v4-backend:latest
```

### **Docker Compose Production**

```bash
# Production deployment
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

### **Environment-specific configs**

- `docker-compose.yaml` - Base configuration
- `docker-compose.override.yaml` - Development overrides
- `docker-compose.prod.yaml` - Production overrides

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose --profile tools up # Start with admin tools
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Firebase Connection Error**

```bash
# Check service account file
ls -la serviceAccount.json

# Verify Firebase project ID in .env
echo $FIREBASE_PROJECT_ID
```

#### **Redis Connection Error**

```bash
# Check Redis is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test Redis connection
redis-cli ping
```

#### **Port Already in Use**

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### **WebSocket Connection Failed**

```bash
# Check CORS settings in .env
CORS_WHITELIST=http://localhost:3000

# Verify WebSocket endpoint
curl -I http://localhost:8080/socket.io/
```

## 🧪 Testing

### **Manual Testing**

1. Start server: `npm run dev`
2. Open Swagger UI: http://localhost:8080/api-docs
3. Test WebSocket: Open `websocket-test.html`

### **API Testing với curl**

```bash
# Health check
curl http://localhost:8080/health

# Create access code
curl -X POST http://localhost:8080/api/owners/create-access-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+84901234567"}'
```

## 📈 Monitoring

### **Logs**

```bash
# Development logs
npm run dev

# Production logs
docker-compose logs -f backend

# Redis logs
docker-compose logs -f redis
```

### **Health Checks**

- API Health: http://localhost:8080/health
- Redis Admin: http://localhost:8081 (with --profile tools)
- API Docs: http://localhost:8080/api-docs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### **Code Style**

- Follow ESLint rules
- Use Prettier for formatting
- Write TypeScript types
- Add JSDoc comments
- Write tests for new features

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **thphan1408** - _Initial work_ - [GitHub](https://github.com/thphan1408)

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- Socket.IO team for real-time capabilities
- Firebase team for the database solution
- Redis team for caching solution
- All contributors who helped improve this project

---

## 📞 Support

Nếu có vấn đề gì, hãy tạo [Issue](https://github.com/thphan1408/challenge_v4/issues) hoặc liên hệ qua email.

**Happy Coding! 🚀**
