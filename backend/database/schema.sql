-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    reset_token TEXT,
    reset_expires INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    category_id INTEGER,
    stock INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Sellers Table
CREATE TABLE IF NOT EXISTS sellers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    business_name TEXT,
    store_name TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed Categories
INSERT INTO categories (name, slug, image) VALUES
    ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
    ('Clothing', 'clothing', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'),
    ('Home & Garden', 'home-garden', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
    ('Books', 'books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'),
    ('Sports', 'sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400');

-- Seed Products
INSERT INTO products (name, description, price, image, category_id, stock, rating) VALUES
    ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 79.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1, 50, 4.5),
    ('Smart Watch', 'Fitness tracking smart watch with heart rate monitor', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1, 30, 4.7),
    ('Laptop Stand', 'Adjustable aluminum laptop stand for better posture', 49.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 1, 100, 4.3),
    ('USB-C Hub', '7-in-1 USB-C hub with HDMI and SD card reader', 39.99, 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400', 1, 75, 4.6),
    ('Bluetooth Speaker', 'Portable waterproof bluetooth speaker', 59.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 1, 60, 4.4),
    ('Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 24.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 2, 200, 4.2),
    ('Denim Jeans', 'Classic fit denim jeans', 49.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 2, 150, 4.5),
    ('Running Shoes', 'Lightweight running shoes with cushioned sole', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 5, 80, 4.8),
    ('Coffee Maker', 'Automatic drip coffee maker with timer', 69.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', 3, 40, 4.1),
    ('Desk Lamp', 'LED desk lamp with adjustable brightness', 34.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 3, 120, 4.4);

-- Seed Admin User (password: admin123)
INSERT INTO users (email, password, name, role) VALUES 
    ('admin@shophub.com', '$2a$10$rQnYL0p.X8Q7qJqJqJqJqOJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'Admin', 'admin');
