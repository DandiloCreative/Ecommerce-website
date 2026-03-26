'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { success, error } = useToast();
    
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [frequentlyBought, setFrequentlyBought] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
                addToRecentlyViewed(data);
            })
            .catch(err => {
                console.error('Error fetching product:', err);
                setLoading(false);
            });

        fetch(`${API_URL}/reviews/product/${id}`)
            .then(res => res.json())
            .then(data => {
                setReviews(data.reviews || []);
                setReviewStats(data.stats || { average: 0, count: 0 });
            })
            .catch(err => console.error('Error fetching reviews:', err));

        fetch(`${API_URL}/recommendations/similar/${id}`)
            .then(res => res.json())
            .then(data => setSimilarProducts(data))
            .catch(err => console.error('Error fetching similar products:', err));

        fetch(`${API_URL}/recommendations/frequently-bought-together/${id}`)
            .then(res => res.json())
            .then(data => setFrequentlyBought(data))
            .catch(err => console.error('Error fetching frequently bought:', err));
    }, [id]);

    const addToRecentlyViewed = (product) => {
        let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);
        recentlyViewed.unshift(product);
        recentlyViewed = recentlyViewed.slice(0, 8);
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            success('Added to cart!');
        }
    };

    const handleWishlist = () => {
        if (product) {
            toggleWishlist(product);
            if (isInWishlist(product.id)) {
                success('Removed from wishlist');
            } else {
                success('Added to wishlist!');
            }
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        if (!token) {
            error('Please login to submit a review');
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    product_id: product.id,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (res.ok) {
                success('Review submitted successfully!');
                setShowReviewForm(false);
                setNewReview({ rating: 5, comment: '' });
                
                const reviewRes = await fetch(`${API_URL}/reviews/product/${product.id}`);
                const reviewData = await reviewRes.json();
                setReviews(reviewData.reviews || []);
                setReviewStats(reviewData.stats || { average: 0, count: 0 });
            } else {
                const data = await res.json();
                error(data.message || 'Failed to submit review');
            }
        } catch (err) {
            error('Something went wrong');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-gray-200 h-96 rounded-lg"></div>
                            <div>
                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                                <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Product not found</h1>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:w-1/2">
                            <div className="relative">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-96 object-cover rounded-lg" 
                                />
                                <button
                                    onClick={handleWishlist}
                                    className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition ${
                                        isInWishlist(product.id) 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="mb-2">
                                <span className="text-sm text-purple-600 font-medium">{product.category_name}</span>
                            </div>
                            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-2xl ${
                                            i < Math.floor(reviewStats.average) ? 'text-cyan-400' : 'text-gray-300'
                                        }`}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="text-lg font-medium">
                                    {reviewStats.average} ({reviewStats.count} {reviewStats.count === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                            
                            <p className="text-4xl font-bold text-purple-600 mb-4">${product.price}</p>
                            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                            
                            <div className="mb-6">
                                <p className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 hover:bg-gray-100 transition"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                        className="w-20 p-2 text-center border-x outline-none"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="px-4 py-2 hover:bg-gray-100 transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                >
                                    Add to Cart
                                </button>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-semibold mb-3">Features:</h3>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    <li>High-quality materials</li>
                                    <li>Free shipping on orders over $50</li>
                                    <li>30-day return policy</li>
                                    <li>24/7 customer support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {frequentlyBought.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span>🛒</span> Frequently Bought Together
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {frequentlyBought.map(item => (
                                <Link key={item.id} href={`/products/${item.id}`}>
                                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-32 object-cover rounded-lg mb-3" 
                                        />
                                        <h3 className="font-medium text-sm truncate mb-2">{item.name}</h3>
                                        <p className="text-lg font-bold text-blue-600">${item.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {similarProducts.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span>👀</span> Similar Products
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarProducts.map(item => (
                                <Link key={item.id} href={`/products/${item.id}`}>
                                    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-40 object-cover" 
                                        />
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-medium text-sm truncate mb-1">{item.name}</h3>
                                            <p className="text-gray-500 text-xs truncate flex-1">{item.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-lg font-bold text-blue-600">${item.price}</span>
                                                <span className="text-yellow-500 text-sm">★ {item.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Customer Reviews</h2>
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                            Write a Review
                        </button>
                    </div>

                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg mb-8">
                            <h3 className="font-semibold mb-4">Your Review</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`text-3xl transition ${
                                                star <= newReview.rating ? 'text-cyan-400' : 'text-gray-300'
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Comment (optional)</label>
                                <textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    rows="4"
                                    placeholder="Share your experience..."
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {reviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                            <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b pb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                                                {review.user_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{review.user_name}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={`text-sm ${
                                                                i < review.rating ? 'text-cyan-400' : 'text-gray-300'
                                                            }`}>
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-700 mt-3">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
