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

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <main className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
                    <Link href="/products" className="text-cyan-600 hover:underline mt-4 inline-block">Back to Products</Link>
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
                        <Link href="/products" className="hover:underline">Products</Link>
                        {' > '}
                        <span className="text-gray-800">{product.name}</span>
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left - Image */}
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

                        {/* Right - Details */}
                        <div>
                            <p className="text-sm text-cyan-600 font-medium mb-1">{product.category_name}</p>
                            <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>
                            
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex">{renderStars(reviewStats.average)}</div>
                                <span className="text-sm text-gray-600">{reviewStats.average} ({reviewStats.count} reviews)</span>
                            </div>
                            
                            <p className="text-3xl font-bold text-purple-600 mb-4">${product.price}</p>
                            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                            
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <p className="text-green-600 font-medium">✓ In Stock</p>
                                ) : (
                                    <p className="text-red-600 font-medium">✗ Out of Stock</p>
                                )}
                            </div>
                            
                            {/* Quantity & Add to Cart */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center border border-gray-400 rounded-lg">
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
                                        className="w-16 text-center border-x border-gray-400 py-2 outline-none"
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
                                    className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-bold py-3 rounded-lg transition disabled:bg-gray-300"
                                >
                                    Add to Cart
                                </button>
                            </div>

                            <div className="border-t pt-4 text-sm text-gray-600">
                                <p className="mb-1">• High-quality materials</p>
                                <p className="mb-1">• Free shipping on orders over $50</p>
                                <p>• 30-day return policy</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Reviews */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Customer Reviews</h2>
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                            Write a Review
                        </button>
                    </div>

                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg mb-6">
                            <h3 className="font-bold mb-4">Your Review</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`text-3xl transition ${
                                                star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
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
                                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:border-cyan-500"
                                    rows="4"
                                    placeholder="Share your experience..."
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:bg-gray-300"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-6 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
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
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                            {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{review.user_name}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex">{renderStars(review.rating)}</div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-700 mt-2 ml-13">{review.comment}</p>
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
