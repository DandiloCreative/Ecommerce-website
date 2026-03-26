'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Products() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || '';
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: initialCategory,
        minPrice: '',
        maxPrice: '',
        sort: ''
    });

    useEffect(() => {
        fetch(`${API_URL}/categories`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Error fetching categories:', err));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);

        setLoading(true);
        fetch(`${API_URL}/products?${params}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setLoading(false);
            });
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Products</h1>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-64">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="font-semibold text-lg mb-4">Filters</h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <input
                                    type="text" 
                                    placeholder="Search products..."
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Price Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number" 
                                        placeholder="Min"
                                        className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                    <input
                                        type="number" 
                                        placeholder="Max"
                                        className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Sort By</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                >
                                    <option value="">Default</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>
                            
                            <button
                                onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '' })}
                                className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </aside>

                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '' })}
                                    className="text-blue-600 hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-4">{products.length} products found</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map(product => (
                                        <Link key={product.id} href={`/products/${product.id}`}>
                                            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                                                <div className="relative">
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name} 
                                                        className="w-full h-48 object-cover rounded-t-lg" 
                                                    />
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-medium text-gray-700">
                                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </div>
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <p className="text-xs text-blue-600 font-medium mb-1">{product.category_name}</p>
                                                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                                                    <p className="text-gray-500 text-sm line-clamp-2 flex-1">{product.description}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-xl font-bold text-blue-600">${product.price}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-yellow-500">★</span>
                                                            <span className="font-medium">{product.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProductSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
    );
}
