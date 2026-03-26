'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Products() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || '';
    const initialSearch = searchParams.get('search') || '';
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const { addToCart } = useCart();
    const { success } = useToast();
    
    const [filters, setFilters] = useState({
        search: initialSearch,
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

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        addToCart(product, 1);
        success('Added to cart!');
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ));
    };

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === parseInt(id));
        return cat ? cat.name : '';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            
            {/* Breadcrumb */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="hover:underline text-gray-800">Home</Link>
                        {' > '}
                        {filters.category ? (
                            <span className="text-gray-800">{getCategoryName(filters.category)}</span>
                        ) : (
                            <span className="text-gray-800">All Products</span>
                        )}
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar Filters */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h2 className="font-bold text-lg mb-4 text-gray-800">Filters</h2>
                            
                            {/* Department */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-gray-800 mb-2">Department</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleFilterChange('category', '')}
                                        className={`block w-full text-left px-2 py-1 text-sm rounded ${!filters.category ? 'bg-cyan-100 text-cyan-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        All Departments
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleFilterChange('category', cat.id.toString())}
                                            className={`block w-full text-left px-2 py-1 text-sm rounded ${filters.category === cat.id.toString() ? 'bg-cyan-100 text-cyan-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6 border-t pt-4">
                                <h3 className="font-semibold text-sm text-gray-800 mb-2">Price Range</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 border rounded text-sm"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 border rounded text-sm"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="mb-4 border-t pt-4">
                                <h3 className="font-semibold text-sm text-gray-800 mb-2">Sort By</h3>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                >
                                    <option value="">Featured</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Avg. Customer Review</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '' })}
                                className="w-full text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results header */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {loading ? 'Loading...' : `${products.length} results for`}
                                {' '}
                                <span className="font-semibold text-gray-800">
                                    {filters.category ? getCategoryName(filters.category) : filters.search || 'All Products'}
                                </span>
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">View:</span>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zM2.5 2a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zm6.5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 8.5v-3a1.5 1.5 0 00-1.5-1.5zm1.5-.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3z"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                                        <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                                <p className="text-gray-600 mb-4">We couldn't find any products matching your criteria.</p>
                                <button
                                    onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '' })}
                                    className="text-cyan-600 hover:text-cyan-700 hover:underline font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' 
                                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                                : 'space-y-4'
                            }>
                                {products.map(product => (
                                    <Link 
                                        key={product.id} 
                                        href={`/products/${product.id}`}
                                        className={`bg-white rounded-lg hover:shadow-lg transition-shadow cursor-pointer ${
                                            viewMode === 'list' ? 'flex p-4' : 'p-3'
                                        }`}
                                    >
                                        <div className={viewMode === 'list' ? 'w-48 shrink-0' : 'mb-3'}>
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className={`w-full object-cover rounded-lg ${viewMode === 'list' ? 'h-32' : 'h-48'}`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
                                            <div className="flex items-center gap-1 mb-1">
                                                {renderStars(product.rating)}
                                                <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">{product.category_name}</p>
                                            <p className="text-xl font-bold text-purple-600 mb-2">${product.price}</p>
                                            {product.stock > 0 ? (
                                                <p className="text-sm text-green-600 font-medium">In Stock</p>
                                            ) : (
                                                <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                                            )}
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className={`mt-3 font-medium text-sm rounded-lg transition ${
                                                    viewMode === 'list' 
                                                        ? 'bg-cyan-400 hover:bg-cyan-500 text-gray-900 px-4 py-2' 
                                                        : 'bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 w-full'
                                                }`}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
