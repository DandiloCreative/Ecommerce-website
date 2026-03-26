const express = require('express');
const db = require('../database/init');

const router = express.Router();

router.get('/', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', [], (err, categories) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(categories);
    });
});

router.get('/:id', (req, res) => {
    db.get('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, category) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    });
});

module.exports = router;
