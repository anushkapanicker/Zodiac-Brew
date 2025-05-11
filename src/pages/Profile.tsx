import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Package, Coffee, Settings, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  coffee_id: string;
  qty: number;
  unitPrice: number;
  _id: string;
  coffeeDetails?: {
    name: string;
    image: string;
    description: string;
  };
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  date: string;
}

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  previousOrders: Order[];
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId'); // Replace with actual user ID fetching logic
        if (!userId) {
          alert('User not logged in.');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const result = await response.json();
        const user = result.data;

        // Fetch coffee details for each order item
        const ordersWithDetails = await Promise.all(
          user.previousOrders.map(async (order: Order) => {
            const itemsWithDetails = await Promise.all(
              order.items.map(async (item: OrderItem) => {
                const coffeeResponse = await fetch(`http://localhost:3000/api/coffees/${item.coffee_id}`);
                const coffeeData = coffeeResponse.ok ? await coffeeResponse.json() : null;
                const coffeeDetails = coffeeData?.data;
                return {
                  ...item,
                  coffeeDetails: coffeeDetails
                    ? {
                        name: coffeeDetails.name,
                        image: coffeeDetails.image,
                        description: coffeeDetails.description,
                      }
                    : null,
                };
              })
            );
            return { ...order, items: itemsWithDetails };
          })
        );

        setUserData({ ...user, previousOrders: ordersWithDetails });
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load user data.');
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleReorder = (order: Order) => {
    // Convert order items to cart format
    const cartItems = order.items.map(item => ({
      coffee: {
        id: item.coffee_id,
        name: item.coffeeDetails?.name || '',
        price: item.unitPrice.toString(),
        image: item.coffeeDetails?.image || '',
        description: item.coffeeDetails?.description || '',
      },
      quantity: item.qty,
    }));

    // Save to cart
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Trigger cart update
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Navigate to cart
    navigate('/cart');
  };

  if (!userData) {
    return (
      <div className="min-h-screen pt-16 bg-amber-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-amber-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-amber-700 p-6 sm:p-10">
              <div className="flex items-center space-x-6">
                <div className="bg-amber-600 p-4 rounded-full">
                  <User size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{userData.fullName}</h1>
                  <p className="text-amber-200">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                    activeTab === 'orders'
                      ? 'border-b-2 border-amber-700 text-amber-700'
                      : 'text-gray-500 hover:text-amber-700'
                  }`}
                >
                  <Package size={20} />
                  <span>Previous Orders</span>
                </button>
              </nav>
            </div>

            {/* Content Sections */}
            <div className="p-6">
              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold text-amber-900 mb-6">Previous Orders</h2>
                  {userData.previousOrders.length > 0 ? (
                    <div className="space-y-6">
                      {userData.previousOrders.map(order => (
                        <div key={order._id} className="bg-amber-50 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">
                              Order Date: {formatDate(order.date)}
                            </span>
                            <span className="text-amber-700 font-bold">
                              Total: ₹{order.totalPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-4">
                            {order.items.map(item => (
                              <div key={item._id} className="flex items-center space-x-4">
                                <img
                                  src={item.coffeeDetails?.image || '/placeholder.jpg'}
                                  alt={item.coffeeDetails?.name || 'Coffee'}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div>
                                  <h3 className="font-medium text-amber-900">
                                    {item.coffeeDetails?.name || 'Coffee Name'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item.qty} × ₹{item.unitPrice}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleReorder(order)}
                              className="flex items-center space-x-2 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
                            >
                              <RefreshCw size={18} />
                              <span>Place Order Again</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">No previous orders found.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;