'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Profile() {
    const { user, logout } = useAuth();
    const { success } = { success: (msg) => alert(msg) };
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
        <div className="min-h-screen bg-gray-100">
            <Header />
            
            {/* Breadcrumb */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="hover:underline">Home</Link>
                        {' > '}
                        <span className="text-gray-800">Your Account</span>
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Account</h1>
                
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-3">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                                >
                                    {editing ? 'Cancel' : 'Edit Profile'}
                                </button>
                                <Link href="/orders" className="block w-full py-2 px-4 border border-gray-300 text-center rounded-lg hover:bg-gray-50 transition font-medium">
                                    Your Orders
                                </Link>
                                <Link href="/wishlist" className="block w-full py-2 px-4 border border-gray-300 text-center rounded-lg hover:bg-gray-50 transition font-medium">
                                    Your Wishlist
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                            <h3 className="font-bold text-gray-800 mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Orders</span>
                                    <span className="font-bold">{orders.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Spent</span>
                                    <span className="font-bold">${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {editing && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({...form, email: e.target.value})}
                                            className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-medium transition"
                                    >
                                        Save Changes
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
                            
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8 text-gray-600">
                                    <p>No orders yet</p>
                                    <Link href="/products" className="text-cyan-600 hover:underline mt-2 inline-block">
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map(order => (
                                        <Link key={order.id} href={`/orders/${order.id}`}>
                                            <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-800">Order #{order.id}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-purple-600">${order.total.toFixed(2)}</p>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    
                                    {orders.length > 5 && (
                                        <Link href="/orders" className="block text-center text-cyan-600 hover:underline py-2 font-medium">
                                            View All Orders →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
