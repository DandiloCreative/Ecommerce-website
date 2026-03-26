'use client';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getTotal } = useCart();
    const { user } = useAuth();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <main className="max-w-7xl mx-auto px-4 py-10">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-2xl mx-auto">
                        <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your ShopHub Cart is empty</h1>
                        <p className="text-gray-600 mb-6">Your shopping cart is waiting to be filled.</p>
                        <Link 
                            href="/products" 
                            className="inline-block bg-cyan-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-500 transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            
            {/* Breadcrumb */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="hover:underline">Home</Link>
                        {' > '}
                        <span className="text-gray-800">Shopping Cart</span>
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
                
                <div className="lg:grid lg:grid-cols-12 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-lg shadow-sm">
                            {/* Cart Header */}
                            <div className="p-4 border-b flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    {cart.length} item{cart.length > 1 ? 's' : ''} in your cart
                                </p>
                                <button
                                    onClick={() => cart.forEach(item => removeFromCart(item.id))}
                                    className="text-sm text-gray-500 hover:text-red-600 transition"
                                >
                                    Delete all
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div className="divide-y">
                                {cart.map(item => (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row gap-4">
                                        {/* Product Image */}
                                        <div className="shrink-0">
                                            <Link href={`/products/${item.id}`}>
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-28 h-28 object-cover rounded-lg hover:opacity-90 transition"
                                                />
                                            </Link>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/products/${item.id}`} className="hover:text-purple-600 transition">
                                                <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mb-2">In Stock</p>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-4 flex-wrap">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                        className="w-14 text-center border-x border-gray-300 py-1 outline-none"
                                                    />
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Action Buttons */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-sm text-red-600 hover:text-red-700 hover:underline transition"
                                                >
                                                    Delete
                                                </button>
                                                <button className="text-sm text-gray-600 hover:text-purple-600 hover:underline transition">
                                                    Save for later
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right shrink-0">
                                            <p className="text-xl font-bold text-purple-600">${(item.price * item.quantity).toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Footer */}
                            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                                <div className="flex justify-between items-center">
                                    <Link href="/products" className="text-cyan-600 hover:text-cyan-700 hover:underline text-sm">
                                        ← Continue Shopping
                                    </Link>
                                    <p className="text-sm text-gray-600">
                                        Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items): 
                                        <span className="font-bold text-lg text-gray-800 ml-1">${getTotal().toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                            <h2 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h2>
                            
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-green-600 font-medium">
                                        {getTotal() >= 50 ? 'Free' : '$5.99'}
                                    </span>
                                </div>
                                {getTotal() < 50 && (
                                    <div className="text-xs text-green-600">
                                        Add ${(50 - getTotal()).toFixed(2)} more for free shipping!
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Subtotal</span>
                                    <span className="text-xl font-bold text-gray-800">${getTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {user ? (
                                <Link href="/checkout">
                                    <button className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-bold py-3 rounded-lg transition mb-3">
                                        Proceed to Checkout
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <button className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-bold py-3 rounded-lg transition mb-3">
                                        Sign in to Checkout
                                    </button>
                                </Link>
                            )}

                            <div className="text-xs text-gray-500 text-center">
                                <p>Tax calculated at checkout</p>
                            </div>
                        </div>

                        {/* Promo Code */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                            <h3 className="font-semibold text-sm mb-2 text-gray-800">Add a promo code</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter code"
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-cyan-400"
                                />
                                <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium transition">
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
