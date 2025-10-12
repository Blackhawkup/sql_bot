# AI SQL Chat Assistant

A full-stack application that provides an AI-powered SQL chat interface with PostgreSQL database integration, Azure OpenAI, and role-based authentication. Designed for company-wide database access with user-specific schema permissions.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + PostgreSQL + Azure OpenAI
- **Database**: PostgreSQL with SSL encryption
- **Authentication**: JWT-based with role-based access control

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL Database (with SSL support)
- Azure OpenAI API key

### Option 1: Docker Compose (Recommended)

1. **Clone and setup**:

   ```bash
   git clone <repository-url>
   cd ai-sql-chat-assistant
   ```

2. **Configure environment**:

   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Run with Docker**:

   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend**:

   ```bash
   cd backend
   ```

2. **Create virtual environment**:

   ```bash
   python -m venv .venv
   # Windows
   .venv\\Scripts\\activate
   # Linux/Mac
   source .venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:

   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

5. **Run backend**:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend Setup

1. **Navigate to root directory**:

   ```bash
   cd ..
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run frontend**:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
POSTGRES_URL=postgresql://username:password@hostname:port/database
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your_azure_openai_key
JWT_SECRET=your_jwt_secret_key_here

# Frontend Configuration (optional)
REACT_APP_API_URL=http://localhost:8000
```

### PostgreSQL Database Setup

1. **Set up PostgreSQL database** with SSL support
2. **Configure connection** in `.env` using POSTGRES_URL
3. **Database will be automatically initialized** with required tables

### Azure OpenAI Setup

1. **Create Azure OpenAI resource**
2. **Deploy GPT-4o-mini model**
3. **Get endpoint and API key**
4. **Configure in `.env`**

## 👥 User Management

### Creating Admin User

The application requires manual user creation. Use the Python shell:

```python
# In backend directory
python -c "
from models import create_user
create_user('admin', 'password123', 'admin', 'Your schema here')
print('Admin user created')
"
```

### Default Users

- **Admin**: username: `admin`, password: `password123`
- **Regular users**: Create via Admin Dashboard

## 🎯 Features

### For All Users

- **SQL Chat Interface**: Natural language to SQL conversion
- **Query Preview**: See SQL and sample results before execution
- **Accept/Retry Flow**: Approve queries or provide feedback
- **Real-time Results**: Execute queries and view data
- **Error Handling**: Comprehensive error messages and loading states
- **Schema-based Security**: Users can only query tables in their assigned schema
- **SELECT-only Safety**: Only SELECT queries are allowed for data protection

### For Admins

- **User Management**: Add/remove users with roles and schemas
- **AI-powered Analysis**: Analyze database usage patterns with Azure OpenAI
- **Schema Management**: Store full company database schema for admin access
- **Usage Insights**: Get recommendations on useful/unused tables and indexes
- **Role-based Access**: Admin-only features and routes

## 🔒 Security Features

### SQL Safety Constraints

- **SELECT-only Queries**: Only SELECT statements are allowed for data safety
- **Schema Validation**: Generated SQL must reference tables from user's assigned schema
- **Non-DB Query Rejection**: Non-database related prompts are rejected with friendly errors
- **SSL Database Connection**: All database connections use SSL encryption
- **Query Logging**: All SQL queries are logged for audit purposes

### User Access Control

- **Schema-based Permissions**: Each user has access only to their assigned database schema
- **Admin Schema Access**: Admins can store and access the full company database schema
- **Required Schema**: All users must have a schema assigned during creation
- **JWT Authentication**: Secure token-based authentication with role-based access

## 🛠️ API Endpoints

### Authentication

- `POST /auth/login` - User login

### Chat

- `POST /api/generate-sql` - Generate SQL from prompt
- `POST /api/run-query` - Execute SQL query
- `POST /api/retry-query` - Retry with feedback

### Admin

- `POST /api/admin/add-user` - Add new user (schema required)
- `POST /api/admin/remove-user` - Remove user
- `GET /api/admin/analyze-columns` - AI-powered database usage analysis
- `POST /api/admin/update-admin-schema` - Update admin's full company schema

## 🐳 Docker Deployment

### Production Deployment

1. **Build images**:

   ```bash
   docker-compose build
   ```

2. **Run in production**:

   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

### Custom Configuration

Modify `docker-compose.yml` for:

- Different ports
- Volume mounts
- Environment variables
- Resource limits

## 🔍 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**:

   - Check POSTGRES_URL in `.env`
   - Ensure database is accessible and SSL is supported
   - Verify network connectivity

2. **SQL Generation Errors**:

   - Ensure user has a valid schema assigned
   - Check that prompts reference database tables/columns
   - Verify Azure OpenAI configuration

3. **Azure OpenAI Errors**:

   - Verify API key and endpoint
   - Check model deployment status
   - Review rate limits

4. **JWT Token Issues**:

   - Clear browser localStorage
   - Check JWT_SECRET configuration
   - Verify token expiration

5. **Frontend Not Loading**:
   - Check if backend is running on port 8000
   - Verify CORS configuration
   - Check browser console for errors

### Development Tips

- **Hot Reload**: Both frontend and backend support hot reload in development
- **API Testing**: Use http://localhost:8000/docs for interactive API testing
- **Database Inspection**: PostgreSQL database tables are automatically created on startup
- **Logs**: Check console output for detailed error messages

## 📁 Project Structure

```
├── src/                    # Frontend source
│   ├── api/               # API client functions
│   ├── components/        # React components
│   ├── context/          # React context (auth)
│   ├── pages/            # Page components
│   └── main.jsx          # Entry point
├── backend/              # Backend source
│   ├── database/         # Database connections
│   ├── routers/          # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   └── main.py           # FastAPI app
├── docker-compose.yml    # Container orchestration
├── Dockerfile.frontend   # Frontend container
└── README.md            # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Open an issue on GitHub
4. Check the logs for detailed error messages
