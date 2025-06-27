import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWalletContext } from '../hooks/useWalletContext';
import { ArrowLeft, Loader2, Clock, ShoppingBag, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { showError } from '../lib/toast';
import orderApi from '../api/order';

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isAuthenticated, isInitialized, getUserData } = useWalletContext();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

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
        
        if (orderId) {
          // Load order details
          await fetchOrderDetails(orderId);
        } else {
          // Redirect to dashboard if no orderId is provided
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load order details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [isAuthenticated, navigate, getUserData, orderId]);

  const fetchOrderDetails = async (id) => {
    try {
      const data = await orderApi.getOrderDetails(id);
      if (data) {
        setOrder(data);
      } else {
        showError('Order not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Failed to load order details');
      navigate('/dashboard');
    }
  };

  const getStatusStyle = (status) => {
    return statusColors[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="mt-4 text-primary/70 dark:text-white/70">Loading order details...</p>
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
          
          <h1 className="text-xl font-bold">Order Details</h1>
          
          {order && (
            <div className="text-sm text-white/80 mt-1">
              Order #{order.orderNumber}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {order ? (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white dark:bg-[#150924] rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-medium text-primary dark:text-white mb-4">Status</h2>
              
              <div className="flex items-center">
                <div className={`px-3 py-1 rounded-full ${getStatusStyle(order.status).bg}`}>
                  <span className={`text-sm font-medium ${getStatusStyle(order.status).text}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mt-4">
                <div className="relative border-l-2 border-primary/20 dark:border-white/20 pl-6 py-2">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-green-500 -ml-[9px]"></div>
                  <div className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2" />
                    <span className="text-sm font-medium text-primary dark:text-white">Order Placed</span>
                  </div>
                  <p className="text-xs text-primary/60 dark:text-white/60 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                
                {order.status !== 'PROCESSING' && (
                  <div className="relative border-l-2 border-primary/20 dark:border-white/20 pl-6 py-2">
                    <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-orange-500 -ml-[9px]"></div>
                    <div className="flex items-center">
                      <Clock size={16} className="text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-primary dark:text-white">Preparing</span>
                    </div>
                    <p className="text-xs text-primary/60 dark:text-white/60 mt-1">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                )}
                
                {(order.status === 'READY' || order.status === 'COMPLETED') && (
                  <div className="relative border-l-2 border-primary/20 dark:border-white/20 pl-6 py-2">
                    <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-green-500 -ml-[9px]"></div>
                    <div className="flex items-center">
                      <ShoppingBag size={16} className="text-green-500 mr-2" />
                      <span className="text-sm font-medium text-primary dark:text-white">Ready for Pickup</span>
                    </div>
                    <p className="text-xs text-primary/60 dark:text-white/60 mt-1">
                      {formatDate(order.readyAt || order.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Details */}
            <div className="bg-white dark:bg-[#150924] rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-medium text-primary dark:text-white mb-4">Order Information</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-primary/70 dark:text-white/70">Establishment</span>
                  <span className="font-medium text-primary dark:text-white">{order.establishmentName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-primary/70 dark:text-white/70">Date</span>
                  <span className="font-medium text-primary dark:text-white">{formatDate(order.createdAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-primary/70 dark:text-white/70">Pickup Location</span>
                  <span className="font-medium text-primary dark:text-white">{order.pickupLocation || 'Counter ' + order.id.slice(-2)}</span>
                </div>
                
                {order.expectedTime && (
                  <div className="flex justify-between">
                    <span className="text-primary/70 dark:text-white/70">Expected Ready Time</span>
                    <span className="font-medium text-primary dark:text-white">{formatDate(order.expectedTime)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white dark:bg-[#150924] rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-medium text-primary dark:text-white mb-4">Items</h2>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.products?.map((item, index) => (
                  <div key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <span className="font-medium text-primary dark:text-white">
                          {item.quantity}x
                        </span>
                      </div>
                      <div>
                        <h4 className="text-primary dark:text-white">{item.product_name}</h4>
                        {item.options && (
                          <p className="text-xs text-primary/60 dark:text-white/60 mt-1">
                            {item.options}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <span className="font-medium text-primary dark:text-white">
                      ${(item.value_real * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-primary/70 dark:text-white/70">Subtotal</span>
                  <span className="text-primary dark:text-white">${order.total_real?.toFixed(2)}</span>
                </div>
                
                {order.tax > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-primary/70 dark:text-white/70">Tax</span>
                    <span className="text-primary dark:text-white">${order.tax?.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center font-bold">
                  <span className="text-primary dark:text-white">Total</span>
                  <span className="text-primary dark:text-white">${order.total_real?.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Support */}
            <div className="bg-white dark:bg-[#150924] rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-medium text-primary dark:text-white mb-2">Need Help?</h2>
              <p className="text-sm text-primary/70 dark:text-white/70 mb-3">
                If you have any issues with your order, please contact the stadium support.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#150924] rounded-lg p-6 text-center shadow-sm">
            <p className="text-primary/70 dark:text-white/70">Order not found</p>
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