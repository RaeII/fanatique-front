import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '../hooks/useWalletContext';
import { ArrowLeft, Loader2, Clock, ShoppingBag, Check, Calendar, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { showError } from '../lib/toast';
import orderApi from '../api/order';

export default function OrdersHistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, getUserData } = useWalletContext();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Status colors mapping
  const statusColors = {
    PROCESSING: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-400' },
    PREPARING: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-600 dark:text-orange-400' },
    READY: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-400' },
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-400' },
    CANCELLED: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-400' }
  };

  // Check if user is authenticated and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (isInitialized && !isAuthenticated) {
          navigate('/');
          return;
        }

        setLoading(true);
        
        // Get user data - we call this to verify authentication
        await getUserData();
        
        // Fetch order history
        await fetchOrderHistory();
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load order history');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [isAuthenticated, navigate, getUserData, isInitialized]);

  // Filter orders when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
      return;
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(order => 
      order.orderNumber?.toString().includes(lowerCaseSearchTerm) ||
      order.establishmentName?.toLowerCase().includes(lowerCaseSearchTerm) ||
      order.status?.toLowerCase().includes(lowerCaseSearchTerm)
    );
    
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const fetchOrderHistory = async () => {
    try {
      const data = await orderApi.getUserOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      showError('Failed to load order history');
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  const getStatusStyle = (status) => {
    return statusColors[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-primary/70 dark:text-white/70">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] dark:bg-[#0d0117]">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="container mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-2"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-xl font-bold">Order History</h1>
          
          <div className="text-sm text-white/80 mt-1">
            View all your past orders
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/50 dark:text-white/50" size={18} />
            <Input 
              placeholder="Search orders by number, establishment, or status" 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                className="bg-white dark:bg-[#150924] rounded-lg p-4 shadow-sm cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-primary dark:text-white">Order #{order.orderNumber}</h3>
                    <div className="text-sm text-primary/70 dark:text-white/70 mt-1">
                      <span>{order.establishmentName}</span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full ${getStatusStyle(order.status).bg}`}>
                    <span className={`text-sm font-medium ${getStatusStyle(order.status).text}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-primary/60 dark:text-white/60 mt-2">
                  <Calendar size={16} className="mr-1" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-primary/60 dark:text-white/60">
                    {order.items?.length || 0} items
                  </span>
                  <span className="font-medium text-primary dark:text-white">
                    ${order.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#150924] rounded-lg p-6 text-center shadow-sm">
            {searchTerm ? (
              <p className="text-primary/70 dark:text-white/70">No orders found matching your search</p>
            ) : (
              <p className="text-primary/70 dark:text-white/70">You haven't placed any orders yet</p>
            )}
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 