'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link href="/" className="text-3xl font-bold text-gray-800">
                        <span className="text-cyan-500">Shop</span>Hub
                    </Link>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign-In</h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-bold py-2 rounded-lg transition disabled:bg-gray-300"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-600 mt-4 text-center">
                        By signing in, you agree to ShopHub's <a href="#" className="text-cyan-600 hover:underline">Conditions of Use</a> and <a href="#" className="text-cyan-600 hover:underline">Privacy Notice</a>.
                    </p>
                </div>

                {/* New Customer */}
                <div className="mt-6 bg-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">New to ShopHub?</p>
                    <Link href="/register" className="block w-full border border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-lg transition">
                        Create your ShopHub account
                    </Link>
                </div>
            </div>
        </div>
    );
}
