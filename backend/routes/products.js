const express = require('express');
const db = require('../database/init');

const router = express.Router();

router.get('/', (req, res) => {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND p.category_id = ?';
        params.push(category);
    }

    if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
        query += ' AND p.price >= ?';
        params.push(minPrice);
    }

    if (maxPrice) {
        query += ' AND p.price <= ?';
        params.push(maxPrice);
    }

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'rating') query += ' ORDER BY p.rating DESC';
    else query += ' ORDER BY p.created_at DESC';

    db.all(query, params, (err, products) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(products);
    });
});

router.get('/search/suggestions', (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
        return res.json([]);
    }
    
    db.all(
        `SELECT p.id, p.name, p.price, p.image, p.rating, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.name LIKE ? OR p.description LIKE ?
         ORDER BY p.rating DESC, p.created_at DESC
         LIMIT 8`,
        [`%${q}%`, `%${q}%`],
        (err, products) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(products);
        }
    );
});

router.get('/:id', (req, res) => {
    db.get(
        'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
        [req.params.id],
        (err, product) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!product) return res.status(404).json({ message: 'Product not found' });
            res.json(product);
        }
    );
});

module.exports = router;
