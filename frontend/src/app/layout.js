import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata = {
    title: 'Dandilo Ecomm Store',
    description: 'Your one-stop shop for all things awesome',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>Dandilo Ecomm Store</title>
            </head>
            <body>
                <ToastProvider>
                    <AuthProvider>
                        <CartProvider>
                            <WishlistProvider>
                                {children}
                            </WishlistProvider>
                        </CartProvider>
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
