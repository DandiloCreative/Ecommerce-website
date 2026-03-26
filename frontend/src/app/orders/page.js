'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Orders() {
    const searchParams = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/orders`, {
            headers: { 'x-auth-token': token }
        })
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching orders:', err);
                setLoading(false);
            });
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            
            if (res.ok) {
                setOrders(orders.map(o => 
                    o.id === orderId ? { ...o, status: 'cancelled' } : o
                ));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to cancel order');
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                </div>
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
                        <span className="text-gray-800">Your Orders</span>
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Orders</h1>

                {searchParams.get('success') && (
                    <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg mb-6">
                        Order #{searchParams.get('order')} placed successfully! Thank you for your purchase.
                    </div>
                )}

                {!localStorage.getItem('token') ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Sign in to view your orders</h2>
                        <p className="text-gray-600 mb-6">Please sign in to see your order history.</p>
                        <Link href="/login" className="inline-block bg-cyan-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-500 transition">
                            Sign In
                        </Link>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
                        <Link href="/products" className="inline-block bg-cyan-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-500 transition">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <p className="font-bold text-gray-800">Order #{order.id}</p>
                                        <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold text-sm text-gray-800 mb-1">Shipping Address</h3>
                                            <p className="text-gray-600 text-sm">{order.shipping_address}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-gray-800 mb-1">Payment Method</h3>
                                            <p className="text-gray-600 text-sm">{order.payment_method}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                        <Link href={`/orders/${order.id}`} className="text-cyan-600 hover:text-cyan-700 hover:underline text-sm font-medium">
                                            View order details →
                                        </Link>
                                        <p className="text-xl font-bold text-purple-600">${order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
