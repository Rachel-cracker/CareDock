# MySQL Setup Instructions for CareDock

## Prerequisites
- MySQL installed and running on your system
- MySQL credentials (username, password, host, port)

## Step 1: Create Environment File

Create a `.env` file in the `backend/` directory with your MySQL configuration:

```bash
# Navigate to backend directory
cd backend/

# Create .env file
touch .env
```

Add the following content to your `.env` file (replace with your actual MySQL credentials):

```env
# Database Configuration
# Replace these values with your actual MySQL credentials:
DATABASE_URL=mysql+pymysql://your_username:your_password@localhost:3306/caredock_db

# Other environment variables
JWT_SECRET_KEY=your-secret-key-here-change-this-in-production
JWT_ALGORITHM=HS256
```

### Example configurations:
- **Local MySQL with default settings:**
  ```
  DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/caredock_db
  ```
  
- **Custom MySQL setup:**
  ```
  DATABASE_URL=mysql+pymysql://caredock_user:secure_password@localhost:3306/caredock_production
  ```

## Step 2: Install Updated Dependencies

```bash
# Make sure you're in the backend directory
cd backend/

# Activate virtual environment
source venv/bin/activate

# Install new dependencies
pip install -r requirements.txt
```

## Step 3: Create MySQL Database (Optional)

If you haven't created a database yet, you can create one using MySQL command line:

```sql
-- Connect to MySQL
mysql -u your_username -p

-- Create database
CREATE DATABASE caredock_db;

-- Create a dedicated user (recommended)
CREATE USER 'caredock_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON caredock_db.* TO 'caredock_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

## Step 4: Test Connection and Setup Tables

Run the setup script to test your connection and create tables:

```bash
# Make sure you're in the backend directory
cd backend/

# Run the setup script
python setup_mysql.py
```

This script will:
- Test your MySQL connection
- Create the database if it doesn't exist
- Create all necessary tables
- Provide feedback on the setup process

## Step 5: Start Your Application

Once the setup is complete, start your backend server:

```bash
# Using the start script
../start_backend.sh

# Or manually
python -m uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Common Issues:

1. **Connection refused:**
   - Ensure MySQL is running: `brew services start mysql` (macOS) or `sudo systemctl start mysql` (Linux)
   - Check if MySQL is listening on the correct port: `netstat -tlnp | grep 3306`

2. **Access denied:**
   - Verify username and password
   - Check user permissions: `SHOW GRANTS FOR 'your_username'@'localhost';`

3. **Database doesn't exist:**
   - The setup script will try to create it automatically
   - Or create manually: `CREATE DATABASE caredock_db;`

4. **Import errors:**
   - Make sure you're in the correct directory
   - Ensure virtual environment is activated
   - Check that all dependencies are installed

### Testing Your Setup:

1. **Test database connection:**
   ```python
   # In Python shell
   import os
   from sqlalchemy import create_engine
   from dotenv import load_dotenv
   
   load_dotenv()
   engine = create_engine(os.getenv("DATABASE_URL"))
   conn = engine.connect()
   print("Connection successful!")
   conn.close()
   ```

2. **Verify tables were created:**
   ```sql
   -- In MySQL command line
   USE caredock_db;
   SHOW TABLES;
   DESCRIBE users;
   DESCRIBE tasks;
   ```

## Switching Back to SQLite (if needed)

If you need to switch back to SQLite temporarily:

1. Update your `.env` file:
   ```env
   DATABASE_URL=sqlite:///./database.db
   ```

2. Restart your application

## Next Steps

Once MySQL is set up:
1. Test all application features to ensure they work correctly
2. Consider setting up database backups
3. Update your deployment configuration if applicable
4. Monitor database performance and optimize as needed

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for database users
- Consider using connection pooling for production
- Regularly update your dependencies
- Set up proper database backups

