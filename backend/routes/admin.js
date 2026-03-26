const express = require('express');
const db = require('../database/init');
const authMiddleware = require('../middleware/auth');
const { sendOrderStatusUpdate } = require('../utils/email');

const router = express.Router();

router.use(authMiddleware, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
});

router.get('/stats', (req, res) => {
    db.serialize(() => {
        db.get('SELECT COUNT(*) as total_users FROM users WHERE role = "user"', (err, users) => {
            if (err) return res.status(500).json({ message: err.message });
            
            db.get('SELECT COUNT(*) as total_products FROM products', (err, products) => {
                if (err) return res.status(500).json({ message: err.message });
                
                db.get('SELECT COUNT(*) as total_orders FROM orders', (err, orders) => {
                    if (err) return res.status(500).json({ message: err.message });
                    
                    db.get('SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE payment_status = "paid"', (err, revenue) => {
                        if (err) return res.status(500).json({ message: err.message });
                        
                        db.get('SELECT COUNT(*) as pending_orders FROM orders WHERE status = "pending"', (err, pending) => {
                            if (err) return res.status(500).json({ message: err.message });
                            
                            res.json({
                                totalUsers: users.total_users,
                                totalProducts: products.total_products,
                                totalOrders: orders.total_orders,
                                revenue: revenue.revenue,
                                pendingOrders: pending.pending_orders
                            });
                        });
                    });
                });
            });
        });
    });
});

router.get('/users', (req, res) => {
    db.all(
        'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC',
        [],
        (err, users) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(users);
        }
    );
});

router.put('/users/:id/role', (req, res) => {
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    
    db.run(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'User role updated' });
        }
    );
});

router.delete('/users/:id', (req, res) => {
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    db.run('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'User deleted' });
    });
});

router.get('/products', (req, res) => {
    db.all(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         ORDER BY p.created_at DESC`,
        [],
        (err, products) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(products);
        }
    );
});

router.post('/products', (req, res) => {
    const { name, description, price, image, category_id, stock } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }
    
    db.run(
        'INSERT INTO products (name, description, price, image, category_id, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description || '', price, image || '', category_id || null, stock || 0],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Product created', product_id: this.lastID });
        }
    );
});

router.put('/products/:id', (req, res) => {
    const { name, description, price, image, category_id, stock } = req.body;
    
    db.run(
        'UPDATE products SET name = COALESCE(?, name), description = COALESCE(?, description), price = COALESCE(?, price), image = COALESCE(?, image), category_id = COALESCE(?, category_id), stock = COALESCE(?, stock) WHERE id = ?',
        [name, description, price, image, category_id, stock, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Product updated' });
        }
    );
});

router.delete('/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Product deleted' });
    });
});

router.get('/orders', (req, res) => {
    db.all(
        `SELECT o.*, u.name as user_name, u.email as user_email 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         ORDER BY o.created_at DESC`,
        [],
        (err, orders) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(orders);
        }
    );
});

router.put('/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    
    db.get('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?', [req.params.id], (err, order) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
            if (err) return res.status(500).json({ message: err.message });
            
            sendOrderStatusUpdate(
                { name: order.user_name, email: order.user_email },
                { id: order.id, status }
            );
            
            res.json({ message: 'Order status updated' });
        });
    });
});

router.get('/orders/:id', (req, res) => {
    db.get(
        `SELECT o.*, u.name as user_name, u.email as user_email 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         WHERE o.id = ?`,
        [req.params.id],
        (err, order) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!order) return res.status(404).json({ message: 'Order not found' });
            
            db.all(
                'SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
                [order.id],
                (err, items) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({ ...order, items });
                }
            );
        }
    );
});

router.get('/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', [], (err, categories) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(categories);
    });
});

router.post('/categories', (req, res) => {
    const { name, image } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    db.run(
        'INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)',
        [name, slug, image || ''],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Category created', category_id: this.lastID });
        }
    );
});

router.put('/categories/:id', (req, res) => {
    const { name, image } = req.body;
    
    db.run(
        'UPDATE categories SET name = COALESCE(?, name), image = COALESCE(?, image) WHERE id = ?',
        [name, image, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Category updated' });
        }
    );
});

router.delete('/categories/:id', (req, res) => {
    db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Category deleted' });
    });
});

module.exports = router;
