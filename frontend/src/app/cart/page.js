'use client';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Link from 'next/link';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <div className="max-w-md mx-auto">
                        <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Link 
                            href="/products" 
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
                
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex gap-6">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-32 h-32 object-cover rounded-lg" 
                                />
                                <div className="flex-1">
                                    <Link href={`/products/${item.id}`}>
                                        <h3 className="font-semibold text-lg hover:text-blue-600 transition mb-2">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xl font-bold text-blue-600 mb-4">${item.price}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-3 py-1 hover:bg-gray-100 transition"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 font-semibold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-3 py-1 hover:bg-gray-100 transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                                    <span className="font-medium">${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>
                            <hr className="my-4" />
                            <div className="flex justify-between text-xl font-bold mb-6">
                                <span>Total</span>
                                <span>${getTotal().toFixed(2)}</span>
                            </div>
                            <Link href="/checkout">
                                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                                    Proceed to Checkout
                                </button>
                            </Link>
                            <Link href="/products">
                                <button className="w-full mt-3 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium">
                                    Continue Shopping
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
