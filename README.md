# ShopHub - E-Commerce Platform

A fully functional e-commerce marketplace built with Next.js, Express, and SQLite.

## Features

- 🛒 **Product Catalog** - Browse products with categories, search, and filters
- 🔐 **User Authentication** - Secure registration and login with JWT
- 🛍️ **Shopping Cart** - Add, update, remove items with persistence
- 💳 **Checkout System** - Complete order process with Cash on Delivery
- 📦 **Order Management** - View order history and status
- 📱 **Responsive Design** - Works on mobile and desktop
- ⚡ **Fast Performance** - Optimized for speed

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Tokens)

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run init-db  # Initialize database with seed data
npm start        # Start server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Start dev server on port 3000
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

## Project Structure

```
/Ecommerce-Website
├── backend/
│   ├── database/
│   │   ├── schema.sql          # Database schema
│   │   └── init.js             # Database initialization
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── products.js         # Product routes
│   │   ├── categories.js       # Category routes
│   │   └── orders.js          # Order routes
│   ├── server.js              # Express server
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.js         # Home page
    │   │   ├── layout.js      # Root layout
    │   │   ├── products/      # Products pages
    │   │   ├── cart/          # Cart page
    │   │   ├── checkout/      # Checkout page
    │   │   ├── orders/        # Orders page
    │   │   ├── login/         # Login page
    │   │   └── register/      # Register page
    │   ├── components/
    │   │   └── Header.js      # Navigation header
    │   └── context/
    │       ├── AuthContext.js  # Authentication context
    │       └── CartContext.js # Shopping cart context
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user orders (protected)
- `GET /api/orders/:id` - Get order details (protected)

## Environment Variables

Create `.env` file in backend directory:

```env
PORT=5000
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

## Seed Data

The database comes pre-loaded with:
- 5 categories (Electronics, Clothing, Home & Garden, Books, Sports)
- 10 sample products
- Sample product images from Unsplash

## Usage Flow

1. **Register/Login** - Create an account or login
2. **Browse Products** - View products by category or search
3. **Add to Cart** - Add items to shopping cart
4. **Checkout** - Enter shipping address and place order
5. **View Orders** - Track order history and status

## Development

### Running in Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Database Management

To reset the database:
```bash
cd backend
rm database/ecommerce.db
npm run init-db
```

## Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] Product reviews and ratings
- [ ] Seller dashboard
- [ ] Advanced search with autocomplete
- [ ] Order tracking with real-time updates
- [ ] Email notifications
- [ ] Admin panel
- [ ] Wishlist functionality
- [ ] Product recommendations

## License

MIT License - feel free to use this project for learning or as a starting point for your own e-commerce platform.

## Support

If you encounter any issues or have questions, please create an issue in this repository.

---

Happy coding! 🚀
