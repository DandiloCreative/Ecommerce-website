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
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                setSearchLoading(true);
                fetch(`${API_URL}/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json())
                    .then(data => {
                        setSuggestions(data);
                        setShowSuggestions(true);
                        setSearchLoading(false);
                    })
                    .catch(() => setSearchLoading(false));
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
            setSearchQuery('');
        }
    };

    const handleSuggestionClick = (productId) => {
        router.push(`/products/${productId}`);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className={`bg-gray-900 text-white sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 shadow-lg' : 'py-4'}`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-cyan-400 hover:text-cyan-300">
                        ShopHub
                    </Link>

                    <div ref={searchRef} className="hidden md:flex items-center relative">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                className="w-80 px-4 py-2 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </form>
                        
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50">
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
                                        <div className="border-t bg-gray-50 p-2">
                                            <button
                                                onClick={handleSearch}
                                                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-1"
                                            >
                                                See all results for "{searchQuery}" →
                                            </button>
                                        </div>
                                    </div>
                                )}
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/products" className="text-white hover:text-cyan-400 transition">
                            Products
                        </Link>
                        {user ? (
                            <>
                                <Link href="/orders" className="text-white hover:text-cyan-400 transition">
                                    Orders
                                </Link>
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="text-white hover:text-cyan-400 transition">
                                        Admin
                                    </Link>
                                )}
                                <Link href="/profile" className="text-white hover:text-cyan-400 transition">
                                    Profile
                                </Link>
                                <span className="text-white">Hi, {user.name}</span>
                                <button 
                                    onClick={handleLogout} 
                                    className="text-white hover:text-cyan-400 transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-white hover:text-cyan-400 transition">
                                Login
                            </Link>
                        )}
                        
                        <Link href="/cart" className="relative text-white hover:text-cyan-400 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/wishlist" className="relative text-white hover:text-cyan-400 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative text-white hover:text-cyan-400 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {(cartCount > 0 || wishlistCount > 0) && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>
                    </nav>

                    <button 
                        className="md:hidden"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {showMobileMenu && (
                    <nav className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
                        <div className="flex flex-col gap-3">
                            <Link href="/products" className="text-white hover:text-cyan-400 transition">Products</Link>
                            {user ? (
                                <>
                                    <Link href="/orders" className="text-white hover:text-cyan-400 transition">Orders</Link>
                                    <Link href="/profile" className="text-white hover:text-cyan-400 transition">Profile</Link>
                                    <span className="text-white">Hi, {user.name}</span>
                                    <button onClick={handleLogout} className="text-left text-white hover:text-cyan-400 transition">Logout</button>
                                </>
                            ) : (
                                <Link href="/login" className="text-white hover:text-cyan-400 transition">Login</Link>
                            )}
                            <Link href="/cart" className="text-white hover:text-cyan-400 transition">
                                Cart ({cartCount})
                            </Link>
                            <Link href="/wishlist" className="text-white hover:text-cyan-400 transition">
                                Wishlist ({wishlistCount})
                            </Link>
                        </div>
                    </nav>
                )}

                {showNotifications && <DynamicIsland />}
            </div>
        </header>
    );
}

function DynamicIsland() {
    const { cart, cartCount } = useCart();
    const { wishlist, wishlistCount } = useWishlist();
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [activeTab, setActiveTab] = useState('cart');

    useEffect(() => {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(viewed);
    }, []);

    const tabs = [
        { id: 'cart', label: 'Cart', count: cartCount, icon: '🛒' },
        { id: 'wishlist', label: 'Wishlist', count: wishlistCount, icon: '❤️' },
        { id: 'recent', label: 'Viewed', count: recentlyViewed.length, icon: '👁️' }
    ];

    return (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-96 bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 animate-slide-up">
            <div className="flex items-center justify-center gap-2 p-1 bg-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Live Activity</span>
            </div>

            <div className="flex border-b border-gray-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition ${
                            activeTab === tab.id 
                                ? 'bg-gray-700 text-white' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.icon} {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="max-h-80 overflow-y-auto">
                {activeTab === 'cart' && (
                    <div className="p-4">
                        {cart.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Your cart is empty</p>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-gray-700">
                                    <p className="text-center font-bold">
                                        Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'wishlist' && (
                    <div className="p-4">
                        {wishlist.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Your wishlist is empty</p>
                        ) : (
                            <div className="space-y-3">
                                {wishlist.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">${item.price}</p>
                                        </div>
                                        <span className="text-yellow-400">❤️</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recent' && (
                    <div className="p-4">
                        {recentlyViewed.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No recently viewed products</p>
                        ) : (
                            <div className="space-y-3">
                                {recentlyViewed.slice(0, 5).map(item => (
                                    <Link key={item.id} href={`/products/${item.id}`}>
                                        <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition cursor-pointer">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-gray-400">${item.price}</p>
                                            </div>
                                            <span className="text-gray-400">→</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
