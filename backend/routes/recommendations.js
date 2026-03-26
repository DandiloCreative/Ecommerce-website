const express = require('express');
const db = require('../database/init');

const router = express.Router();

router.get('/recommended', (req, res) => {
    db.all(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         ORDER BY p.rating DESC, p.created_at DESC 
         LIMIT 8`,
        [],
        (err, products) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(products);
        }
    );
});

router.get('/frequently-bought-together/:productId', (req, res) => {
    const productId = req.params.productId;
    
    db.get('SELECT category_id FROM products WHERE id = ?', [productId], (err, product) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        db.all(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.category_id = ? AND p.id != ? 
             ORDER BY p.rating DESC 
             LIMIT 4`,
            [product.category_id, productId],
            (err, relatedProducts) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json(relatedProducts);
            }
        );
    });
});

router.get('/similar/:productId', (req, res) => {
    const productId = req.params.productId;
    
    db.get('SELECT category_id, price FROM products WHERE id = ?', [productId], (err, product) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        const priceMin = product.price * 0.7;
        const priceMax = product.price * 1.3;
        
        db.all(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id != ? AND (
                 p.category_id = ? OR 
                 (p.price >= ? AND p.price <= ?)
             )
             ORDER BY p.rating DESC 
             LIMIT 6`,
            [productId, product.category_id, priceMin, priceMax],
            (err, similarProducts) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json(similarProducts);
            }
        );
    });
});

router.get('/trending', (req, res) => {
    db.all(
        `SELECT p.*, c.name as category_name, 
                COALESCE(COUNT(o.id), 0) as order_count
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN order_items o ON p.id = o.product_id
         GROUP BY p.id
         ORDER BY order_count DESC, p.rating DESC
         LIMIT 8`,
        [],
        (err, products) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(products);
        }
    );
});

router.get('/new-arrivals', (req, res) => {
    db.all(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         ORDER BY p.created_at DESC 
         LIMIT 8`,
        [],
        (err, products) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(products);
        }
    );
});

module.exports = router;
