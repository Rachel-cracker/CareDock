# CareDock - Healthcare Management System

A modern, full-stack healthcare management system built with HTML/CSS/JavaScript frontend and FastAPI/MySQL backend.

## 🏥 Features

### Frontend
- **Modern, Responsive Design**: Beautiful UI with mobile-first approach
- **Interactive Components**: Smooth animations and user interactions
- **Healthcare-Themed**: Professional medical interface design
- **Cross-Browser Compatible**: Works on all modern browsers

### Backend
- **FastAPI Framework**: High-performance Python web framework
- **MySQL Database**: Robust relational database for healthcare data
- **JWT Authentication**: Secure user authentication and authorization
- **RESTful API**: Complete CRUD operations for all entities
- **Role-Based Access Control**: Admin, Doctor, Nurse, and User roles

### Core Functionality
- **User Management**: Complete user registration, authentication, and profile management
- **Patient Management**: Comprehensive patient records with medical history
- **Appointment Scheduling**: Advanced appointment booking with conflict detection
- **Medical Records**: Secure storage of patient medical information
- **Real-time Updates**: Live data synchronization

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- Node.js (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CareDock
   ```

2. **Setup Database**
   ```bash
   # Start MySQL service
   sudo systemctl start mysql
   
   # Create database and tables
   mysql -u root -p < database/setup.sql
   ```

3. **Setup Backend**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy environment file
   cp env.example .env
   
   # Edit .env file with your database credentials
   nano .env
   ```

4. **Start Backend Server**
   ```bash
   # From backend directory
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access Frontend**
   ```bash
   # Open frontend/index.html in your browser
   # Or serve with a local server
   cd frontend
   python -m http.server 8001
   ```

## 📁 Project Structure

```
CareDock/
├── frontend/                 # Frontend application
│   ├── index.html           # Main HTML file
│   ├── css/                 # Stylesheets
│   │   ├── styles.css       # Main styles
│   │   └── responsive.css   # Responsive design
│   ├── js/                  # JavaScript files
│   │   └── main.js          # Main JavaScript
│   └── images/              # Image assets
├── backend/                 # Backend application
│   ├── app/                 # Main application
│   │   └── main.py          # FastAPI application entry point
│   ├── config/              # Configuration files
│   │   ├── settings.py      # Application settings
│   │   └── database.py      # Database configuration
│   ├── models/              # Database models
│   │   ├── user.py          # User model
│   │   ├── patient.py       # Patient model
│   │   └── appointment.py   # Appointment model
│   ├── controllers/         # API controllers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User management
│   │   ├── patients.py      # Patient management
│   │   └── appointments.py  # Appointment management
│   ├── utils/               # Utility functions
│   │   └── logger.py        # Logging configuration
│   └── requirements.txt     # Python dependencies
├── database/                # Database files
│   └── setup.sql           # Database setup script
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/caredock

# Security
SECRET_KEY=your-secret-key-here

# Application
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

### Default Users

The system comes with pre-configured users:

- **Admin**: `admin` / `admin123`
- **Doctor**: `doctor` / `doctor123`
- **Nurse**: `nurse` / `nurse123`

## 📚 API Documentation

Once the backend is running, access the API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users/` - List users
- `GET /api/patients/` - List patients
- `GET /api/appointments/` - List appointments

## 🛠️ Development

### Running Tests
```bash
cd backend
pytest
```

### Code Formatting
```bash
cd backend
black .
isort .
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## 🔒 Security Features

- **JWT Token Authentication**: Secure API access
- **Password Hashing**: Bcrypt password encryption
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Cross-origin resource sharing

## 📱 Frontend Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional healthcare interface
- **Interactive Elements**: Smooth animations and transitions
- **Form Validation**: Client-side validation with user feedback
- **Accessibility**: WCAG compliant design

## 🚀 Deployment

### Production Setup

1. **Database**
   ```bash
   # Use production MySQL instance
   # Configure connection pooling
   # Enable SSL connections
   ```

2. **Backend**
   ```bash
   # Use production WSGI server (Gunicorn)
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   
   # Configure reverse proxy (Nginx)
   # Enable HTTPS
   # Set up monitoring
   ```

3. **Frontend**
   ```bash
   # Deploy to CDN or web server
   # Configure caching
   # Enable compression
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and management
  - Patient records management
  - Appointment scheduling
  - Modern responsive frontend
  - RESTful API backend

---

**CareDock** - Modern Healthcare Management System 🏥
