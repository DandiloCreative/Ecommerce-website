'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommended, setRecommended] = useState([]);
    const { addToCart } = useCart();
    const { success } = useToast();

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/products`).then(res => res.json()),
            fetch(`${API_URL}/categories`).then(res => res.json()),
            fetch(`${API_URL}/recommendations`).then(res => res.json())
        ])
            .then(([productsData, categoriesData, recommendationsData]) => {
                setProducts(productsData);
                setCategories(categoriesData);
                setRecommended(recommendationsData.recommended || productsData.slice(0, 8));
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setLoading(false);
            });
    }, []);

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        success('Added to cart!');
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ));
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
            
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-r from-purple-700 to-purple-900 h-64 md:h-80">
                <div className="max-w-7xl mx-auto px-4 flex items-center h-full">
                    <div className="text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">ShopHub</h1>
                        <p className="text-xl md:text-2xl mb-6 text-purple-200">Your One-Stop Shop for Everything</p>
                        <Link href="/products" className="inline-block bg-cyan-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-500 transition">
                            Shop Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Categories */}
            <div className="bg-gray-800 py-3">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-6 overflow-x-auto text-sm text-white">
                        {categories.map(cat => (
                            <Link key={cat.id} href={`/products?category=${cat.id}`} className="whitespace-nowrap hover:underline">
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Recommended Products */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Recommended for You</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {recommended.map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition p-3 group">
                                <Link href={`/products/${product.id}`}>
                                    <div className="relative overflow-hidden rounded-lg mb-3">
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                                        />
                                        {product.stock < 10 && product.stock > 0 && (
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                Only {product.stock} left
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1 h-10">{product.name}</h3>
                                    <div className="flex items-center gap-1 mb-1">
                                        {renderStars(product.rating)}
                                        <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                                    </div>
                                    <p className="text-xl font-bold text-purple-600">${product.price}</p>
                                </Link>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full mt-3 bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-semibold py-2 rounded-lg transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Browse by Category */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {categories.map(cat => (
                            <Link 
                                key={cat.id} 
                                href={`/products?category=${cat.id}`}
                                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition p-4 text-center group"
                            >
                                <div className="w-full h-32 mb-3 overflow-hidden rounded-lg">
                                    <img 
                                        src={cat.image} 
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                </div>
                                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                                <p className="text-sm text-purple-600 mt-1">Shop Now →</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* All Products */}
                <section className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">All Products</h2>
                        <Link href="/products" className="text-purple-600 hover:underline font-semibold">
                            See All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {products.slice(0, 12).map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition p-3 group">
                                <Link href={`/products/${product.id}`}>
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-32 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
                                    />
                                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1 h-10">{product.name}</h3>
                                    <div className="flex text-sm mb-1">
                                        {renderStars(product.rating)}
                                    </div>
                                    <p className="text-lg font-bold text-purple-600">${product.price}</p>
                                </Link>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 rounded-lg transition text-sm"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Deal of the Day */}
                <section className="bg-gradient-to-r from-purple-700 to-cyan-500 rounded-xl p-6 text-white mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">Deal of the Day</h2>
                            <p className="text-purple-200 mb-4">Up to 40% off on selected items!</p>
                            <Link href="/products?sort=rating" className="inline-block bg-white text-purple-700 font-bold px-6 py-2 rounded-lg hover:bg-purple-100 transition">
                                Shop Deals
                            </Link>
                        </div>
                        <div className="flex gap-4">
                            {products.slice(0, 3).map(product => (
                                <div key={product.id} className="bg-white rounded-lg p-3 text-center">
                                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg mb-2" />
                                    <p className="text-gray-800 font-bold">${(product.price * 0.7).toFixed(2)}</p>
                                    <p className="text-gray-500 line-through text-sm">${product.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Top Rated Products */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Top Rated Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.filter(p => p.rating >= 4.5).slice(0, 5).map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition p-3 group">
                                <Link href={`/products/${product.id}`}>
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-36 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
                                    />
                                    <div className="flex items-center gap-1 mb-1">
                                        {renderStars(product.rating)}
                                        <span className="text-sm text-gray-500">{product.rating}</span>
                                    </div>
                                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1 h-10">{product.name}</h3>
                                    <p className="text-lg font-bold text-purple-600">${product.price}</p>
                                </Link>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full mt-2 bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-semibold py-1.5 rounded-lg transition text-sm"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Back to top */}
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg transition"
            >
                ↑ Back to top
            </button>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-12">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">Get to Know Us</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:underline">Careers</a></li>
                                <li><a href="#" className="hover:underline">Blog</a></li>
                                <li><a href="#" className="hover:underline">About ShopHub</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Customer Service</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:underline">Help Center</a></li>
                                <li><a href="#" className="hover:underline">Returns</a></li>
                                <li><a href="#" className="hover:underline">Contact Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Make Money with Us</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/seller" className="hover:underline">Sell on ShopHub</Link></li>
                                <li><a href="#" className="hover:underline">Become an Affiliate</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Let Us Help You</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:underline">Your Account</a></li>
                                <li><a href="#" className="hover:underline">Your Orders</a></li>
                                <li><a href="#" className="hover:underline">Help</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
                        <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
