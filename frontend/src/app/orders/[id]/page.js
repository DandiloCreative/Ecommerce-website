'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function OrderDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch(`${API_URL}/orders/${id}`, {
            headers: { 'x-auth-token': token }
        })
            .then(res => {
                if (!res.ok) throw new Error('Order not found');
                return res.json();
            })
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching order:', err);
                setLoading(false);
            });
    }, [id, router]);

    const getStatusStep = (status) => {
        const steps = ['pending', 'processing', 'shipped', 'delivered'];
        return steps.indexOf(status);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-500';
            case 'processing': return 'bg-blue-500';
            case 'shipped': return 'bg-purple-500';
            case 'delivered': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <div className="text-xl">Loading order details...</div>
                </main>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                    <Link href="/orders" className="text-blue-600 hover:underline">
                        Back to Orders
                    </Link>
                </main>
            </div>
        );
    }

    const currentStep = getStatusStep(order.status);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link href="/orders" className="text-blue-600 hover:underline mb-4 inline-block">
                            ← Back to Orders
                        </Link>
                        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                        <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                        <h2 className="text-xl font-semibold mb-6">Order Status</h2>
                        
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                            <div 
                                className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-500"
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            ></div>
                            
                            <div className="relative flex justify-between">
                                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, index) => (
                                    <div key={step} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold z-10 ${
                                            index <= currentStep ? getStatusColor(order.status) : 'bg-gray-300'
                                        }`}>
                                            {index < currentStep ? '✓' : index + 1}
                                        </div>
                                        <p className="text-sm font-medium mt-2">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <p className="text-blue-800 font-medium">
                                {order.status === 'pending' && '⏳ Your order is being reviewed'}
                                {order.status === 'processing' && '⚙️ Your order is being prepared'}
                                {order.status === 'shipped' && '📦 Your order is on its way!'}
                                {order.status === 'delivered' && '✅ Your order has been delivered'}
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                            <p className="text-gray-700">{order.shipping_address}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <p className="text-gray-700">{order.payment_method}</p>
                            <p className="text-sm text-gray-600 mt-2">
                                Total: <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-6">Order Items</h2>
                        <div className="space-y-4">
                            {order.items?.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-20 h-20 object-cover rounded-lg" 
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
                                        <p className="text-sm text-gray-600">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold">Total</span>
                                <span className="text-2xl font-bold text-blue-600">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link 
                            href="/products" 
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
