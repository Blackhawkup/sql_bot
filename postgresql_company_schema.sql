-- PostgreSQL Company Database Schema

-- Table 1: users (for login and role testing)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: departments (for CRUD and relational testing)
CREATE TABLE IF NOT EXISTS departments (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100)
);

-- Table 3: employees (for query execution and joins)
CREATE TABLE IF NOT EXISTS employees (
    emp_id SERIAL PRIMARY KEY,
    emp_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    salary DECIMAL(10,2),
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

-- Table 4: query_logs (for tracking user-submitted queries)
CREATE TABLE IF NOT EXISTS query_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT,
    query_text TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, password_hash, role) VALUES
('admin1', 'hashed_admin_pass', 'admin'),
('user1', 'hashed_user_pass', 'user'),
('user2', 'hashed_user_pass2', 'user')
ON CONFLICT (username) DO NOTHING;

INSERT INTO departments (dept_name, location) VALUES
('Engineering', 'Mumbai'),
('HR', 'Delhi'),
('Finance', 'Bangalore')
ON CONFLICT (dept_name) DO NOTHING;

INSERT INTO employees (emp_name, email, salary, dept_id) VALUES
('Rohit Mehta', 'rohit@company.com', 90000, 1),
('Sneha Patel', 'sneha@company.com', 75000, 2),
('Karan Gupta', 'karan@company.com', 120000, 1),
('Aditi Rao', 'aditi@company.com', 80000, 3)
ON CONFLICT (email) DO NOTHING;

INSERT INTO query_logs (user_id, query_text) VALUES
(2, 'SELECT * FROM employees WHERE salary > 80000;'),
(3, 'SELECT emp_name FROM employees WHERE dept_id = 2;');
