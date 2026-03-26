const express = require('express');
const db = require('../database/init');
const authMiddleware = require('../middleware/auth');
const { sendOrderConfirmation } = require('../utils/email');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
    const { items, shipping_address, payment_method } = req.body;
    const user_id = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        let total = 0;
        const orderItems = [];

        const insertOrder = () => {
            db.run(
                'INSERT INTO orders (user_id, total, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
                [user_id, total, shipping_address, payment_method || 'COD'],
                function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ message: err.message });
                    }

                    const order_id = this.lastID;
                    const insertItem = (i) => {
                        if (i >= orderItems.length) {
                            db.run('COMMIT');
                            
                            db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, user) => {
                                if (user) {
                                    db.all(
                                        'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
                                        [order_id],
                                        (err, orderItemsFull) => {
                                            sendOrderConfirmation(user, {
                                                id: order_id,
                                                total,
                                                shipping_address,
                                                payment_method,
                                                items: orderItemsFull
                                            });
                                        }
                                    );
                                }
                            });
                            
                            return res.json({ message: 'Order created', order_id, total });
                        }
                        db.run(
                            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                            [order_id, orderItems[i].product_id, orderItems[i].quantity, orderItems[i].price],
                            (err) => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return res.status(500).json({ message: err.message });
                                }
                                insertItem(i + 1);
                            }
                        );
                    };
                    insertItem(0);
                }
            );
        };

        const processItems = (i) => {
            if (i >= items.length) {
                insertOrder();
                return;
            }
            db.get('SELECT price, stock FROM products WHERE id = ?', [items[i].product_id], (err, product) => {
                if (err || !product) {
                    db.run('ROLLBACK');
                    return res.status(400).json({ message: 'Invalid product' });
                }
                total += product.price * items[i].quantity;
                orderItems.push({ product_id: items[i].product_id, quantity: items[i].quantity, price: product.price });
                processItems(i + 1);
            });
        };
        processItems(0);
    });
});

router.get('/', authMiddleware, (req, res) => {
    db.all(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, orders) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(orders);
        }
    );
});

router.get('/:id', authMiddleware, (req, res) => {
    db.get(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
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

router.put('/:id/cancel', authMiddleware, (req, res) => {
    db.get(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        (err, order) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!order) return res.status(404).json({ message: 'Order not found' });
            
            if (order.status !== 'pending') {
                return res.status(400).json({ message: 'Only pending orders can be cancelled' });
            }
            
            db.run(
                'UPDATE orders SET status = ? WHERE id = ?',
                ['cancelled', req.params.id],
                (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({ message: 'Order cancelled successfully' });
                }
            );
        }
    );
});

module.exports = router;
