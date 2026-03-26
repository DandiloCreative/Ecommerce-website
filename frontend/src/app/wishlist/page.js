'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function Wishlist() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { success } = useToast();

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        success('Added to cart!');
    };

    const handleRemove = (productId) => {
        removeFromWishlist(productId);
        success('Removed from wishlist');
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ));
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                
                {/* Breadcrumb */}
                <div className="bg-gray-100 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <p className="text-sm text-gray-600">
                            <Link href="/" className="hover:underline">Home</Link>
                            {' > '}
                            <span className="text-gray-800">Wishlist</span>
                        </p>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-lg shadow-sm p-12 max-w-2xl mx-auto">
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Wishlist is empty</h1>
                        <p className="text-gray-600 mb-6">Save items you like by tapping the heart icon.</p>
                        <Link href="/products" className="inline-block bg-cyan-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-500 transition">
                            Continue Shopping
                        </Link>
                    </div>
                </main>
            </div>
        );
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
                        <span className="text-gray-800">Wishlist</span>
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Wishlist ({wishlist.length} items)</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlist.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-lg transition">
                            <div className="relative mb-3">
                                <Link href={`/products/${product.id}`}>
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition"
                                    />
                                </Link>
                                <button
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <Link href={`/products/${product.id}`} className="hover:text-purple-600 transition">
                                <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 h-12">{product.name}</h3>
                            </Link>
                            
                            <div className="flex items-center gap-1 mb-2">
                                {renderStars(product.rating)}
                                <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                            </div>
                            
                            <p className="text-xl font-bold text-purple-600 mb-3">${product.price}</p>
                            
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-bold py-2 rounded-lg transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
