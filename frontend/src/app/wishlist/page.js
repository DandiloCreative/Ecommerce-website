'use client';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/Header';
import Link from 'next/link';

export default function Wishlist() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { success } = useToast();

    const handleAddToCart = (product) => {
        addToCart(product);
        success('Added to cart!');
        removeFromWishlist(product.id);
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-8xl mb-6">❤️</div>
                        <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
                        <p className="text-gray-600 mb-8">Save items you love by clicking the heart icon on any product.</p>
                        <Link 
                            href="/products" 
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Browse Products
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
                <p className="text-gray-600 mb-8">{wishlist.length} items in your wishlist</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlist.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <Link href={`/products/${product.id}`}>
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-48 object-cover" 
                                />
                            </Link>
                            <div className="p-4">
                                <h3 className="font-semibold mb-2 truncate">{product.name}</h3>
                                <p className="text-xl font-bold text-blue-600 mb-4">${product.price}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => {
                                            removeFromWishlist(product.id);
                                            success('Removed from wishlist');
                                        }}
                                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
