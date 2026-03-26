const express = require('express');
const db = require('../database/init');
const authMiddleware = require('../middleware/auth');
const Stripe = require('stripe');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');

router.post('/create-payment-intent', authMiddleware, async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items provided' });
    }

    try {
        let total = 0;
        
        for (const item of items) {
            const product = await new Promise((resolve, reject) => {
                db.get('SELECT price FROM products WHERE id = ?', [item.id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!product) {
                return res.status(400).json({ message: `Product ${item.id} not found` });
            }
            total += product.price * item.quantity;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: {
                user_id: req.user.id.toString()
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: total
        });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ message: 'Payment processing error' });
    }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        let event;

        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            event = JSON.parse(req.body);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const userId = paymentIntent.metadata.user_id;

            db.all(
                'SELECT id FROM orders WHERE user_id = ? AND status = "pending" ORDER BY created_at DESC LIMIT 1',
                [userId],
                (err, orders) => {
                    if (err || orders.length === 0) return;
                    
                    db.run(
                        'UPDATE orders SET payment_status = "paid" WHERE id = ?',
                        [orders[0].id],
                        (err) => {
                            if (err) console.error('Error updating payment status:', err);
                        }
                    );
                }
            );
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(400).json({ message: 'Webhook error' });
    }
});

module.exports = router;
