# Database Schema Format Guide

This guide explains the correct format for uploading database schemas for both regular users and admin users.

## Schema Format Requirements

### 1. **User Schema Format** (for regular users)

Regular users should upload a **subset** of the database schema containing only the tables and columns they have access to.

**Format**: SQL DDL (Data Definition Language) statements

**Example**:

```sql
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    product_name VARCHAR(200),
    quantity INT,
    price DECIMAL(10,2),
    order_date TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INT
);
```

### 2. **Admin Schema Format** (for admin users)

Admin users should upload the **complete** database schema containing all tables and columns in the system.

**Format**: SQL DDL (Data Definition Language) statements

**Example**:

```sql
-- Complete database schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    user_id INT,
    product_name VARCHAR(200),
    quantity INT,
    price DECIMAL(10,2),
    order_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INT,
    supplier_id INT
);

CREATE TABLE suppliers (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    phone VARCHAR(20)
);

CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_user VARCHAR(50),
    action VARCHAR(200),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Schema Guidelines

### ✅ **What to Include**

- `CREATE TABLE` statements
- Column definitions with data types
- Primary keys (`PRIMARY KEY`)
- Foreign keys (`FOREIGN KEY`)
- Constraints (`UNIQUE`, `NOT NULL`, `DEFAULT`)
- Indexes (optional but recommended)

### ❌ **What NOT to Include**

- `INSERT` statements (data)
- `UPDATE` statements
- `DELETE` statements
- `DROP` statements
- Comments that don't describe structure
- Database-specific configuration

### 📝 **Best Practices**

1. **Use Standard SQL**: Stick to standard SQL data types and syntax
2. **Be Descriptive**: Use clear, descriptive table and column names
3. **Include Relationships**: Show foreign key relationships
4. **Add Constraints**: Include NOT NULL, UNIQUE, and DEFAULT constraints
5. **Use Consistent Naming**: Follow a consistent naming convention (snake_case recommended)

### 🔧 **Data Types to Use**

| Purpose     | Recommended Type      | Example                |
| ----------- | --------------------- | ---------------------- |
| Primary Key | `INT` or `SERIAL`     | `id INT PRIMARY KEY`   |
| Text        | `VARCHAR(n)`          | `name VARCHAR(100)`    |
| Long Text   | `TEXT`                | `description TEXT`     |
| Numbers     | `INT`, `DECIMAL(p,s)` | `price DECIMAL(10,2)`  |
| Dates       | `TIMESTAMP`           | `created_at TIMESTAMP` |
| Booleans    | `BOOLEAN`             | `is_active BOOLEAN`    |
| Email       | `VARCHAR(255)`        | `email VARCHAR(255)`   |

### 📋 **Example for Different User Roles**

#### **Sales User Schema** (Limited Access)

```sql
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    product_name VARCHAR(200),
    quantity INT,
    price DECIMAL(10,2),
    order_date TIMESTAMP
);
```

#### **Inventory User Schema** (Different Access)

```sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INT
);

CREATE TABLE suppliers (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255)
);
```

#### **Admin Schema** (Full Access)

```sql
-- All tables from both sales and inventory schemas
-- Plus additional admin-only tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20)
);

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INT
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    product_name VARCHAR(200),
    quantity INT,
    price DECIMAL(10,2),
    order_date TIMESTAMP
);

CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_user VARCHAR(50),
    action VARCHAR(200),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## How to Upload Schemas

### **For Regular Users**:

1. Go to Admin Panel
2. Click "Add User"
3. Fill in user details
4. Paste the **user schema** in the "Schema" field
5. Click "Add User"

### **For Admin Users**:

1. Go to Admin Panel
2. Click "Add User"
3. Fill in user details with role "admin"
4. Paste the **user schema** in the "Schema" field
5. Paste the **admin schema** in the "Admin Schema" field
6. Click "Add User"

## Testing Your Schema

After uploading a schema, test it by:

1. Logging in as that user
2. Asking questions about the tables in their schema
3. Verifying the AI generates correct SQL queries
4. Checking that the queries run successfully

## Troubleshooting

### **Common Issues**:

- **"Schema not found"**: Make sure you're using `CREATE TABLE` statements
- **"Invalid SQL"**: Check for typos in column names or data types
- **"Table not recognized"**: Ensure table names match exactly in your queries
- **"Column not found"**: Verify column names are spelled correctly

### **Need Help?**

If you're unsure about the schema format, contact your system administrator or refer to your database documentation.

