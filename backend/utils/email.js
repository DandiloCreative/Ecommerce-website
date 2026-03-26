const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'test@ethereal.email',
        pass: process.env.EMAIL_PASS || 'testpass'
    }
});

const sendEmail = async ({ to, subject, html }) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('\n========================================');
        console.log('📧 EMAIL NOTIFICATION (Development Mode)');
        console.log('========================================');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('----------------------------------------');
        console.log(html);
        console.log('========================================\n');
        return { messageId: 'dev-' + Date.now() };
    }

    try {
        const info = await transporter.sendMail({
            from: `"ShopHub" <${process.env.EMAIL_FROM || 'noreply@shophub.com'}>`,
            to,
            subject,
            html
        });
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        return null;
    }
};

const sendOrderConfirmation = async (user, order) => {
    const itemsHtml = order.items.map(item => 
        `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name || `Product #${item.product_id}`}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    ).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Order Confirmed!</h1>
            <p>Hi ${user.name},</p>
            <p>Thank you for your order! Here are your order details:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #f3f4f6;">
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: left;">Quantity</th>
                        <th style="padding: 10px; text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 10px; font-weight: bold;">Total:</td>
                        <td style="padding: 10px; font-weight: bold;">$${order.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <p><strong>Shipping Address:</strong> ${order.shipping_address}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method}</p>
            <p><strong>Order ID:</strong> #${order.id}</p>
            
            <p style="margin-top: 30px;">We'll notify you when your order ships!</p>
            <p>Thank you for shopping with us!</p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: `Order Confirmed - #${order.id}`,
        html
    });
};

const sendOrderStatusUpdate = async (user, order) => {
    const statusMessages = {
        pending: 'Your order is being reviewed',
        processing: 'Your order is being prepared',
        shipped: 'Your order has been shipped!',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
    };

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Order Update</h1>
            <p>Hi ${user.name},</p>
            <p>Your order #${order.id} status has been updated:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
                <p style="color: #666; margin: 5px 0 0 0;">
                    ${statusMessages[order.status] || 'Status updated'}
                </p>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            <p>Thank you for shopping with us!</p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: `Order Update - #${order.id}`,
        html
    });
};

const sendPasswordReset = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Password Reset</h1>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html
    });
};

module.exports = {
    sendEmail,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendPasswordReset
};
