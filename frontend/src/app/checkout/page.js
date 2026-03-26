'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';

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

        if (form.payment_method === 'Card' && (!cardNumber || !cardExpiry || !cardCvc)) {
            setError('Please fill in all card details');
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
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">Add some items to checkout</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>
                
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Street Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="123 Main St"
                                    value={form.address}
                                    onChange={(e) => setForm({...form, address: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="New York"
                                        value={form.city}
                                        onChange={(e) => setForm({...form, city: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">State</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="NY"
                                        value={form.state}
                                        onChange={(e) => setForm({...form, state: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="10001"
                                    value={form.zip}
                                    onChange={(e) => setForm({...form, zip: e.target.value})}
                                />
                            </div>
                            
                            <h2 className="text-xl font-bold mt-8 mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${form.payment_method === 'COD' ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={form.payment_method === 'COD'}
                                        onChange={(e) => setForm({...form, payment_method: e.target.value})}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <span className="font-medium">Cash on Delivery (COD)</span>
                                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                                    </div>
                                </label>
                                
                                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${form.payment_method === 'Card' ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Card"
                                        checked={form.payment_method === 'Card'}
                                        onChange={(e) => setForm({...form, payment_method: e.target.value})}
                                        className="w-5 h-5"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium">Credit/Debit Card</span>
                                        <p className="text-sm text-gray-500">Pay securely with your card</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/visa.svg" alt="Visa" className="h-6" />
                                        <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/mc.svg" alt="Mastercard" className="h-6" />
                                    </div>
                                </label>

                                {form.payment_method === 'Card' && (
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Card Number</label>
                                            <input
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                maxLength="19"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                    maxLength="5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">CVC</label>
                                                <input
                                                    type="text"
                                                    placeholder="123"
                                                    value={cardCvc}
                                                    onChange={(e) => setCardCvc(e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                    maxLength="4"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            For testing, use card number: 4242 4242 4242 4242
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 font-medium mt-6"
                            >
                                {loading ? 'Processing...' : `Place Order - $${getTotal().toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-20 h-20 object-cover rounded" 
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{item.name}</p>
                                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                            <p className="text-purple-600 font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <hr className="my-4" />
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>
                            <hr className="my-4" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>${getTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
