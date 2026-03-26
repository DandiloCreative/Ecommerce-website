'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`),
            fetch(`${API_URL}/recommendations/recommended`),
            fetch(`${API_URL}/recommendations/trending`)
        ])
            .then(([resProducts, resCategories, resRecommended, resTrending]) => 
                Promise.all([resProducts.json(), resCategories.json(), resRecommended.json(), resTrending.json()])
            )
            .then(([productsData, categoriesData, recommendedData, trendingData]) => {
                setProducts(productsData);
                setCategories(categoriesData);
                setRecommended(recommendedData);
                setTrending(trendingData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categories.map(cat => (
                            <Link key={cat.id} href={`/products?category=${cat.id}`}>
                                <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow cursor-pointer">
                                    <img 
                                        src={cat.image} 
                                        alt={cat.name} 
                                        className="w-full h-32 object-cover rounded-lg mb-3" 
                                    />
                                    <h3 className="font-semibold text-center">{cat.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {recommended.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold">Recommended For You</h2>
                            <span className="text-sm text-gray-500">Based on your preferences</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {recommended.slice(0, 4).map(product => (
                                <Link key={product.id} href={`/products/${product.id}`}>
                                    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                                        <div className="relative">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-full h-48 object-cover rounded-t-lg" 
                                            />
                                            <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                                                ⭐ Top Rated
                                            </span>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-semibold truncate mb-1">{product.name}</h3>
                                            <p className="text-gray-500 text-sm truncate flex-1">{product.description}</p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xl font-bold text-blue-600">${product.price}</span>
                                                <span className="text-yellow-500">★ {product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {trending.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold">🔥 Trending Now</h2>
                            <span className="text-sm text-gray-500">Most popular this week</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {trending.slice(0, 4).map(product => (
                                <Link key={product.id} href={`/products/${product.id}`}>
                                    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                                        <div className="relative">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-full h-48 object-cover rounded-t-lg" 
                                            />
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                🔥 Hot
                                            </span>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-semibold truncate mb-1">{product.name}</h3>
                                            <p className="text-gray-500 text-sm truncate flex-1">{product.description}</p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xl font-bold text-blue-600">${product.price}</span>
                                                <span className="text-yellow-500">★ {product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.slice(0, 8).map(product => (
                            <Link key={product.id} href={`/products/${product.id}`}>
                                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-48 object-cover rounded-t-lg" 
                                    />
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold truncate mb-1">{product.name}</h3>
                                        <p className="text-gray-500 text-sm truncate flex-1">{product.description}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xl font-bold text-blue-600">${product.price}</span>
                                            <span className="text-yellow-500">★ {product.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
