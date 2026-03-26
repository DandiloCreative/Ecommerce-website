const express = require('express');
const db = require('../database/init');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', (req, res) => {
    db.all(
        `SELECT r.*, u.name as user_name 
         FROM reviews r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.product_id = ? 
         ORDER BY r.created_at DESC`,
        [req.params.productId],
        (err, reviews) => {
            if (err) return res.status(500).json({ message: err.message });
            
            db.get(
                `SELECT AVG(rating) as average, COUNT(*) as count 
                 FROM reviews WHERE product_id = ?`,
                [req.params.productId],
                (err, stats) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({
                        reviews,
                        stats: {
                            average: stats.average ? parseFloat(stats.average.toFixed(1)) : 0,
                            count: stats.count
                        }
                    });
                }
            );
        }
    );
});

router.post('/', authMiddleware, (req, res) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating) {
        return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    db.run(
        'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [product_id, user_id, rating, comment || ''],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });

            db.get('SELECT AVG(rating) as average FROM reviews WHERE product_id = ?', [product_id], (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                
                db.run('UPDATE products SET rating = ? WHERE id = ?', [result.average, product_id], (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                });
            });

            res.json({ message: 'Review added successfully', review_id: this.lastID });
        }
    );
});

router.delete('/:id', authMiddleware, (req, res) => {
    db.get('SELECT * FROM reviews WHERE id = ?', [req.params.id], (err, review) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        db.run('DELETE FROM reviews WHERE id = ?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Review deleted successfully' });
        });
    });
});

module.exports = router;
