'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Checkout() {
    const { cart, getTotal, clearCart } = useCart();
    const router = useRouter();
    const [form, setForm] = useState({
        address: '',
        city: '',
        state: '',
        zip: '',
        payment_method: 'COD'
    });
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        if (cart.length === 0) {
            setError('Your cart is empty');
            setLoading(false);
            return;
        }

        const orderData = {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            shipping_address: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
            payment_method: form.payment_method
        };

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            if (res.ok) {
                clearCart();
                router.push(`/orders?success=true&order=${data.order_id}`);
            } else {
                setError(data.message || 'Failed to place order');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <main className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">Add some items to checkout</p>
                    <Link href="/products" className="inline-block bg-cyan-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-500 transition">
                        Continue Shopping
                    </Link>
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
                        <Link href="/cart" className="hover:underline">Cart</Link>
                        {' > '}
                        <span className="text-gray-800">Checkout</span>
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
                
                <div className="lg:grid lg:grid-cols-12 gap-6">
                    {/* Left - Forms */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">1. Shipping Address</h2>
                            
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500"
                                        placeholder="Street address"
                                        value={form.address}
                                        onChange={(e) => setForm({...form, address: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500"
                                            placeholder="City"
                                            value={form.city}
                                            onChange={(e) => setForm({...form, city: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500"
                                            placeholder="State"
                                            value={form.state}
                                            onChange={(e) => setForm({...form, state: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500"
                                        placeholder="ZIP Code"
                                        value={form.zip}
                                        onChange={(e) => setForm({...form, zip: e.target.value})}
                                    />
                                </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">2. Payment Method</h2>
                            
                            <div className="space-y-3">
                                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${form.payment_method === 'COD' ? 'border-cyan-500 bg-cyan-50' : 'hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={form.payment_method === 'COD'}
                                        onChange={(e) => setForm({...form, payment_method: e.target.value})}
                                        className="mt-1"
                                    />
                                    <div>
                                        <span className="font-bold">Cash on Delivery (COD)</span>
                                        <p className="text-sm text-gray-500">Pay with cash upon delivery</p>
                                    </div>
                                </label>
                                
                                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${form.payment_method === 'Card' ? 'border-cyan-500 bg-cyan-50' : 'hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Card"
                                        checked={form.payment_method === 'Card'}
                                        onChange={(e) => setForm({...form, payment_method: e.target.value})}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <span className="font-bold">Credit/Debit Card</span>
                                        <p className="text-sm text-gray-500 mb-2">Pay securely with your card</p>
                                        <div className="flex gap-2 mb-3">
                                            <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/visa.svg" alt="Visa" className="h-6" />
                                            <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/mc.svg" alt="Mastercard" className="h-6" />
                                        </div>
                                        
                                        {form.payment_method === 'Card' && (
                                            <div className="space-y-3 mt-3 pt-3 border-t">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Card number"
                                                        value={cardNumber}
                                                        onChange={(e) => setCardNumber(e.target.value)}
                                                        className="w-full p-2 border border-gray-400 rounded-lg text-sm"
                                                        maxLength="19"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        value={cardExpiry}
                                                        onChange={(e) => setCardExpiry(e.target.value)}
                                                        className="p-2 border border-gray-400 rounded-lg text-sm"
                                                        maxLength="5"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="CVC"
                                                        value={cardCvc}
                                                        onChange={(e) => setCardCvc(e.target.value)}
                                                        className="p-2 border border-gray-400 rounded-lg text-sm"
                                                        maxLength="4"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">Test card: 4242 4242 4242 4242</p>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-bold py-3 rounded-lg transition disabled:bg-gray-300 text-lg"
                        >
                            {loading ? 'Processing...' : `Place your order - $${getTotal().toFixed(2)}`}
                        </button>
                    </div>

                    {/* Right - Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Order Summary</h2>
                            
                            <div className="space-y-3 text-sm mb-4 max-h-64 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 line-clamp-2">{item.name}</p>
                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span>${(getTotal() * 0.08).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-purple-600">${(getTotal() * 1.08).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
