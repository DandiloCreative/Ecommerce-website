const express = require('express');
const db = require('../database/init');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, (req, res, next) => {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Seller account required.' });
    }
    next();
});

router.get('/stats', (req, res) => {
    const userId = req.user.id;
    
    db.serialize(() => {
        db.get('SELECT COUNT(*) as total_products FROM products', (err, products) => {
            if (err) return res.status(500).json({ message: err.message });
            
            db.get(
                `SELECT COALESCE(SUM(oi.quantity), 0) as total_sold, COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
                 FROM order_items oi
                 JOIN orders o ON oi.order_id = o.id
                 WHERE o.user_id = ? AND o.status != 'cancelled'`,
                [userId],
                (err, sales) => {
                    if (err) return res.status(500).json({ message: err.message });
                    
                    db.get(
                        'SELECT COALESCE(SUM(stock), 0) as total_stock FROM products',
                        [],
                        (err, stock) => {
                            if (err) return res.status(500).json({ message: err.message });
                            
                            res.json({
                                totalProducts: products.total_products,
                                totalSold: sales.total_sold,
                                totalRevenue: sales.total_revenue,
                                totalStock: stock.total_stock
                            });
                        }
                    );
                }
            );
        });
    });
});

router.get('/products', (req, res) => {
    db.all(
        `SELECT p.*, c.name as category_name,
                (SELECT COUNT(*) FROM order_items WHERE product_id = p.id) as sold_count
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

router.get('/orders', (req, res) => {
    db.all(
        `SELECT o.*, u.name as customer_name, u.email as customer_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.status != 'cancelled'
         ORDER BY o.created_at DESC`,
        [],
        (err, orders) => {
            if (err) return res.status(500).json({ message: err.message });
            
            const enrichedOrders = orders.map(order => {
                return new Promise((resolve) => {
                    db.all(
                        `SELECT oi.*, p.name as product_name 
                         FROM order_items oi 
                         JOIN products p ON oi.product_id = p.id 
                         WHERE oi.order_id = ?`,
                        [order.id],
                        (err, items) => {
                            resolve({ ...order, items });
                        }
                    );
                });
            });
            
            Promise.all(enrichedOrders).then(results => {
                res.json(results);
            });
        }
    );
});

router.put('/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    
    db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Order status updated' });
        }
    );
});

router.get('/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', [], (err, categories) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(categories);
    });
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

module.exports = router;
