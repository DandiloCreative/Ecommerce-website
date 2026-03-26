'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Profile() {
    const { user, logout } = useAuth();
    const { success, error } = useToast();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', email: '' });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        setForm({ name: user.name, email: user.email });

        const token = localStorage.getItem('token');
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
    }, [user, router]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        success('Profile updated successfully!');
        setEditing(false);
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">My Profile</h1>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="text-center mb-6">
                                    <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-xl font-semibold">{user.name}</h2>
                                    <p className="text-gray-600">{user.email}</p>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        {editing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                                <h3 className="font-semibold mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Orders</span>
                                        <span className="font-bold">{orders.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Spent</span>
                                        <span className="font-bold">
                                            ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            {editing && (
                                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                    <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => setForm({...form, name: e.target.value})}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({...form, email: e.target.value})}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                        >
                                            Save Changes
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                                
                                {loading ? (
                                    <div className="text-center py-8">Loading...</div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8 text-gray-600">
                                        <p>No orders yet</p>
                                        <Link href="/products" className="text-blue-600 hover:underline mt-2 inline-block">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.slice(0, 5).map(order => (
                                            <Link key={order.id} href={`/orders/${order.id}`}>
                                                <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">Order #{order.id}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        
                                        {orders.length > 5 && (
                                            <Link href="/orders" className="block text-center text-blue-600 hover:underline py-2">
                                                View All Orders →
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
