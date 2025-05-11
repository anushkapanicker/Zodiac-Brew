import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Coffee } from 'lucide-react';

interface CartCoffee {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
}

interface CartItem {
  coffee: CartCoffee;
  quantity: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCartItems();
    // Add event listener for cart updates
    window.addEventListener('cartUpdated', loadCartItems);
    return () => {
      window.removeEventListener('cartUpdated', loadCartItems);
    };
  }, []);

  const loadCartItems = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      calculateTotal(parsedCart);
    }
  };

  const calculateTotal = (items: CartItem[]) => {
    const newTotal = items.reduce((sum, item) => {
      const price = parseFloat(item.coffee.price);
      return sum + (price * item.quantity);
    }, 0);
    setTotal(newTotal);
  };

  const updateQuantity = (coffeeId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => 
      item.coffee.id === coffeeId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const removeItem = (coffeeId: number) => {
    const updatedItems = cartItems.filter(item => item.coffee.id !== coffeeId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

const handleCheckout = async () => {
  if (cartItems.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  try {
    // Fetch the user's ID (assuming it's stored in localStorage or fetched from an API)
    const userId = localStorage.getItem('userId'); // Replace with actual user ID fetching logic
    if (!userId) {
      alert('User not logged in. Please log in to place an order.');
      return;
    }

    // Prepare the order data
    const items = cartItems.map(item => ({
      coffee_id: item.coffee.id,
      qty: item.quantity,
      unitPrice: parseFloat(item.coffee.price),
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

    const orderData = {
      items,
      user_id: userId,
      totalPrice,
    };

    // Send the order data to the API
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to place the order');
    }

    const result = await response.json();
    console.log('Order placed successfully:', result);

    // Clear the cart
    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    alert('Order placed successfully!');
  } catch (error) {
    console.error('Error placing the order:', error);
    alert('There was an error placing your order. Please try again.');
  }
};
  return (
    <div className="min-h-screen pt-16 bg-amber-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-amber-900 flex items-center">
                <ShoppingCart size={32} className="mr-3" />
                Your Cart
              </h1>
              <p className="text-gray-600">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {cartItems.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.coffee.id}
                      className="flex items-center py-4 border-b last:border-b-0"
                    >
                      <img
                        src={item.coffee.image}
                        alt={item.coffee.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-grow ml-4">
                        <h3 className="text-lg font-medium text-amber-900">{item.coffee.name}</h3>
                        <p className="text-gray-600">{item.coffee.price}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.coffee.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.coffee.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.coffee.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <span className="font-medium text-lg">Total</span>
                    <span className="font-bold text-lg">₹{(total).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Coffee size={20} />
                    <span>Place Order</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some delicious coffee to get started!</p>
                <a
                  href="/services"
                  className="inline-flex items-center px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
                >
                  <Coffee size={20} className="mr-2" />
                  Browse Coffees
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;