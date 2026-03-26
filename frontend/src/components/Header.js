'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Header() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const searchRef = useRef(null);
    const accountRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setShowAccountMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                fetch(`${API_URL}/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json())
                    .then(data => {
                        setSuggestions(data);
                        setShowSuggestions(true);
                    })
                    .catch(() => setSuggestions([]));
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 200);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}&category=${category}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (productId) => {
        router.push(`/products/${productId}`);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const handleLogout = () => {
        logout();
        setShowAccountMenu(false);
        router.push('/');
    };

    return (
        <header className="bg-gray-900">
            {/* Top bar */}
            <div className="bg-gray-900 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center shrink-0">
                            <span className="text-white font-bold text-2xl">
                                <span className="text-cyan-400">Shop</span>Hub
                            </span>
                        </Link>

                        {/* Delivery location */}
                        <div className="hidden md:flex items-center text-white text-sm cursor-pointer hover:underline">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                                <p className="text-xs text-gray-400">Deliver to</p>
                                <p className="font-semibold">Your Location</p>
                            </div>
                        </div>

                        {/* Search bar */}
                        <div ref={searchRef} className="flex-1 max-w-3xl relative hidden md:block">
                            <form onSubmit={handleSearch} className="flex">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="bg-gray-100 text-gray-800 px-3 py-2 text-sm border-r border-gray-300 rounded-l-lg focus:outline-none"
                                >
                                    <option value="all">All</option>
                                    <option value="1">Electronics</option>
                                    <option value="2">Clothing</option>
                                    <option value="3">Home & Garden</option>
                                    <option value="4">Books</option>
                                    <option value="5">Sports</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search ShopHub"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 px-4 py-2 text-gray-800 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="bg-cyan-400 hover:bg-cyan-500 px-4 py-2 rounded-r-lg"
                                >
                                    <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>

                            {/* Search suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                                    {suggestions.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSuggestionClick(product.id)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition text-left"
                                        >
                                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.category_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600">${product.price}</p>
                                                <p className="text-xs text-cyan-500">★ {product.rating}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right side nav */}
                        <div className="flex items-center gap-1 md:gap-4">
                            {/* Account */}
                            <div ref={accountRef} className="relative">
                                <button
                                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                                    className="text-white hover:underline p-2 hidden md:block"
                                >
                                    <p className="text-xs text-gray-400">Hello, {user ? user.name.split(' ')[0] : 'Sign in'}</p>
                                    <p className="font-bold text-sm">Account & Lists</p>
                                </button>

                                {showAccountMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl z-50 p-4">
                                        {user ? (
                                            <div className="space-y-3">
                                                <div className="border-b pb-3">
                                                    <p className="font-bold text-gray-800">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                                <Link href="/profile" onClick={() => setShowAccountMenu(false)} className="block text-gray-800 hover:text-purple-600">Your Account</Link>
                                                <Link href="/orders" onClick={() => setShowAccountMenu(false)} className="block text-gray-800 hover:text-purple-600">Your Orders</Link>
                                                <Link href="/wishlist" onClick={() => setShowAccountMenu(false)} className="block text-gray-800 hover:text-purple-600">Your Wishlist</Link>
                                                {user.role === 'admin' && (
                                                    <Link href="/admin" onClick={() => setShowAccountMenu(false)} className="block text-purple-600 font-semibold hover:text-purple-700">Admin Dashboard</Link>
                                                )}
                                                {user.role === 'seller' && (
                                                    <Link href="/seller" onClick={() => setShowAccountMenu(false)} className="block text-green-600 font-semibold hover:text-green-700">Seller Dashboard</Link>
                                                )}
                                                <button onClick={handleLogout} className="w-full text-left text-gray-800 hover:text-purple-600">Sign Out</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Link href="/login" onClick={() => setShowAccountMenu(false)} className="block bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700">Sign In</Link>
                                                <p className="text-center text-sm text-gray-500">New customer? <Link href="/register" className="text-cyan-600 hover:underline">Start here</Link></p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Returns & Orders */}
                            <Link href="/orders" className="text-white hover:underline p-2 hidden md:block">
                                <p className="text-xs text-gray-400">Returns</p>
                                <p className="font-bold text-sm">& Orders</p>
                            </Link>

                            {/* Cart */}
                            <Link href="/cart" className="relative p-2 text-white flex items-center gap-1">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 left-5 bg-cyan-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                                <span className="font-bold text-sm hidden md:block">Cart</span>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white p-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile search */}
                    <div className="md:hidden mt-3 pb-2">
                        <form onSubmit={handleSearch} className="flex">
                            <input
                                type="text"
                                placeholder="Search ShopHub"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-2 text-gray-800 rounded-l-lg"
                            />
                            <button type="submit" className="bg-cyan-400 px-4 rounded-r-lg">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Navigation bar */}
            <div className="bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <nav className="flex items-center gap-6 text-sm text-white overflow-x-auto">
                        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="flex items-center gap-1 hover:underline md:hidden">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            All
                        </button>
                        <Link href="/products" className="hover:underline hidden md:block">All Products</Link>
                        <Link href="/products?category=1" className="hover:underline">Electronics</Link>
                        <Link href="/products?category=2" className="hover:underline">Clothing</Link>
                        <Link href="/products?category=3" className="hover:underline">Home & Garden</Link>
                        <Link href="/products?category=4" className="hover:underline">Books</Link>
                        <Link href="/products?category=5" className="hover:underline">Sports</Link>
                        <Link href="/wishlist" className="hover:underline hidden md:block">Wishlist</Link>
                        <span className="ml-auto text-cyan-400 font-semibold hidden md:block">Free Shipping on Orders $50+</span>
                    </nav>
                </div>
            </div>

            {/* Mobile menu */}
            {showMobileMenu && (
                <div className="md:hidden bg-gray-800 border-t border-gray-700 p-4">
                    <div className="space-y-3 text-white">
                        {user ? (
                            <>
                                <p className="font-bold">Hello, {user.name}</p>
                                <Link href="/profile" className="block hover:underline">Your Account</Link>
                                <Link href="/orders" className="block hover:underline">Your Orders</Link>
                                <Link href="/wishlist" className="block hover:underline">Your Wishlist</Link>
                                {user.role === 'admin' && <Link href="/admin" className="block text-cyan-400 hover:underline">Admin Dashboard</Link>}
                                <button onClick={handleLogout} className="text-left hover:underline">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="block bg-purple-600 text-white text-center py-2 rounded-lg">Sign In</Link>
                                <Link href="/register" className="block text-center hover:underline">Create Account</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
