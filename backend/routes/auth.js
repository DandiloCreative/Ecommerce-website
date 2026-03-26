const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database/init');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, 'user'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ message: 'Email already exists' });
                    }
                    return res.status(500).json({ message: err.message });
                }
                
                const token = jwt.sign({ id: this.lastID, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
                res.json({ 
                    token, 
                    user: { id: this.lastID, email, name, role: 'user' } 
                });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { id: user.id, email: user.email, name: user.name, role: user.role } 
        });
    });
});

router.get('/me', authMiddleware, (req, res) => {
    db.get('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    });
});

router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) {
            return res.json({ message: 'If the email exists, a reset link will be sent' });
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = Date.now() + 3600000;
        
        db.run(
            'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
            [resetToken, resetExpires, user.id],
            (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ 
                    message: 'If the email exists, a reset link will be sent',
                    resetToken
                });
            }
        );
    });
});

router.post('/reset-password', (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
    }
    
    db.get(
        'SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?',
        [token, Date.now()],
        async (err, user) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
            
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
                [hashedPassword, user.id],
                (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({ message: 'Password reset successful' });
                }
            );
        }
    );
});

module.exports = router;
