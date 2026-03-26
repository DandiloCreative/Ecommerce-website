'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image: '', category_id: '', stock: '' });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        if (!userData || (userData.role !== 'seller' && userData.role !== 'admin')) {
            router.push('/');
            return;
        }
        setUser(userData);
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const [statsRes, productsRes, ordersRes, categoriesRes] = await Promise.all([
                fetch(`${API_URL}/seller/stats`, { headers: { 'x-auth-token': token } }),
                fetch(`${API_URL}/seller/products`, { headers: { 'x-auth-token': token } }),
                fetch(`${API_URL}/seller/orders`, { headers: { 'x-auth-token': token } }),
                fetch(`${API_URL}/seller/categories`, { headers: { 'x-auth-token': token } })
            ]);
            
            const [statsData, productsData, ordersData, categoriesData] = await Promise.all([
                statsRes.json(), productsRes.json(), ordersRes.json(), categoriesRes.json()
            ]);
            
            setStats(statsData);
            setProducts(productsData);
            setOrders(ordersData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`${API_URL}/seller/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const handleOrderStatus = async (orderId, status) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/seller/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ status })
            });
            
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error('Error updating order:', err);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const url = editingProduct 
            ? `${API_URL}/seller/products/${editingProduct.id}`
            : `${API_URL}/seller/products`;
        
        const method = editingProduct ? 'PUT' : 'POST';
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(productForm)
            });
            
            if (res.ok) {
                setShowProductForm(false);
                setEditingProduct(null);
                setProductForm({ name: '', description: '', price: '', image: '', category_id: '', stock: '' });
                fetchData();
            }
        } catch (err) {
            console.error('Error saving product:', err);
        }
    };

    const editProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            image: product.image || '',
            category_id: product.category_id ? product.category_id.toString() : '',
            stock: product.stock.toString()
        });
        setShowProductForm(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-16">Loading...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-64">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <nav className="space-y-2">
                                {['dashboard', 'products', 'orders'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                            activeTab === tab ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <div className="flex-1">
                        {activeTab === 'dashboard' && stats && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <p className="text-gray-500 text-sm">Total Products</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <p className="text-gray-500 text-sm">Items Sold</p>
                                        <p className="text-3xl font-bold text-green-600">{stats.totalSold}</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <p className="text-gray-500 text-sm">Total Revenue</p>
                                        <p className="text-3xl font-bold text-yellow-600">${stats.totalRevenue.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <p className="text-gray-500 text-sm">Total Stock</p>
                                        <p className="text-3xl font-bold text-purple-600">{stats.totalStock}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2">Order #</th>
                                                    <th className="text-left py-2">Customer</th>
                                                    <th className="text-left py-2">Items</th>
                                                    <th className="text-left py-2">Total</th>
                                                    <th className="text-left py-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.slice(0, 5).map(order => (
                                                    <tr key={order.id} className="border-b">
                                                        <td className="py-3">{order.id}</td>
                                                        <td className="py-3">{order.customer_name}</td>
                                                        <td className="py-3">{order.items?.length || 0}</td>
                                                        <td className="py-3">${order.total.toFixed(2)}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">My Products</h2>
                                    <button
                                        onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', image: '', category_id: '', stock: '' }); }}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Add Product
                                    </button>
                                </div>

                                {showProductForm && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h3 className="text-lg font-semibold mb-4">
                                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                                        </h3>
                                        <form onSubmit={handleProductSubmit} className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={productForm.name}
                                                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                                        className="w-full p-2 border rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Price ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        required
                                                        value={productForm.price}
                                                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                                        className="w-full p-2 border rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Description</label>
                                                <textarea
                                                    value={productForm.description}
                                                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                                    className="w-full p-2 border rounded-lg"
                                                    rows="3"
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                                    <input
                                                        type="text"
                                                        value={productForm.image}
                                                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                                                        className="w-full p-2 border rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Category</label>
                                                    <select
                                                        value={productForm.category_id}
                                                        onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                                                        className="w-full p-2 border rounded-lg"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Stock</label>
                                                    <input
                                                        type="number"
                                                        value={productForm.stock}
                                                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                                                        className="w-full p-2 border rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    type="submit"
                                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                                >
                                                    {editingProduct ? 'Update' : 'Add'} Product
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowProductForm(false)}
                                                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2">ID</th>
                                                    <th className="text-left py-2">Image</th>
                                                    <th className="text-left py-2">Name</th>
                                                    <th className="text-left py-2">Price</th>
                                                    <th className="text-left py-2">Stock</th>
                                                    <th className="text-left py-2">Sold</th>
                                                    <th className="text-left py-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map(product => (
                                                    <tr key={product.id} className="border-b">
                                                        <td className="py-3">{product.id}</td>
                                                        <td className="py-3">
                                                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                                        </td>
                                                        <td className="py-3">{product.name}</td>
                                                        <td className="py-3">${product.price}</td>
                                                        <td className="py-3">{product.stock}</td>
                                                        <td className="py-3">{product.sold_count || 0}</td>
                                                        <td className="py-3">
                                                            <button
                                                                onClick={() => editProduct(product)}
                                                                className="text-green-600 hover:underline mr-4"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete('products', product.id)}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Orders</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2">ID</th>
                                                <th className="text-left py-2">Customer</th>
                                                <th className="text-left py-2">Items</th>
                                                <th className="text-left py-2">Total</th>
                                                <th className="text-left py-2">Status</th>
                                                <th className="text-left py-2">Update Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} className="border-b">
                                                    <td className="py-3">{order.id}</td>
                                                    <td className="py-3">
                                                        <p className="font-medium">{order.customer_name}</p>
                                                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                                                    </td>
                                                    <td className="py-3">
                                                        {order.items?.map(item => (
                                                            <p key={item.id} className="text-sm">{item.product_name} x{item.quantity}</p>
                                                        ))}
                                                    </td>
                                                    <td className="py-3">${order.total.toFixed(2)}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                                                            className="border rounded px-2 py-1 text-sm"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
