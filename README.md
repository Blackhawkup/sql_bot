# AI SQL Chat Assistant

A full-stack application that provides an AI-powered SQL chat interface with Oracle database integration, Azure OpenAI, and role-based authentication.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + SQLite + cx_Oracle + Azure OpenAI
- **Database**: Oracle (with SQLite for user management)
- **Authentication**: JWT-based with role-based access control

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (for containerized deployment)
- Oracle Database (or use mock mode)
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
ORACLE_USER=your_oracle_username
ORACLE_PASSWORD=your_oracle_password
ORACLE_DSN=your_oracle_dsn
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your_azure_openai_key
JWT_SECRET=your_jwt_secret_key_here

# Frontend Configuration (optional)
REACT_APP_API_URL=http://localhost:8000
```

### Oracle Database Setup

1. **Install Oracle Instant Client** (for local development)
2. **Configure connection** in `.env`
3. **Alternative**: Use mock mode by leaving Oracle credentials empty

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

### For Admins

- **User Management**: Add/remove users with roles and schemas
- **Column Analysis**: Analyze column usage patterns
- **Role-based Access**: Admin-only features and routes

## 🛠️ API Endpoints

### Authentication

- `POST /auth/login` - User login

### Chat

- `POST /api/generate-sql` - Generate SQL from prompt
- `POST /api/run-query` - Execute SQL query
- `POST /api/retry-query` - Retry with feedback

### Admin

- `POST /api/admin/add-user` - Add new user
- `POST /api/admin/remove-user` - Remove user
- `GET /api/admin/analyze-columns` - Analyze column usage

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

1. **Oracle Connection Failed**:

   - Check Oracle credentials in `.env`
   - Ensure Oracle Instant Client is installed
   - Verify network connectivity

2. **Azure OpenAI Errors**:

   - Verify API key and endpoint
   - Check model deployment status
   - Review rate limits

3. **JWT Token Issues**:

   - Clear browser localStorage
   - Check JWT_SECRET configuration
   - Verify token expiration

4. **Frontend Not Loading**:
   - Check if backend is running on port 8000
   - Verify CORS configuration
   - Check browser console for errors

### Development Tips

- **Hot Reload**: Both frontend and backend support hot reload in development
- **API Testing**: Use http://localhost:8000/docs for interactive API testing
- **Database Inspection**: SQLite database is stored in `backend/app.db`
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




