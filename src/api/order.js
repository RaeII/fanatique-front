import api from '../lib/api';

const getOrder = async (orderId) => {
  const response = await api.get(`/order/${orderId}`);
  return response.data?.content || null;
};

const getMatchOrders = async (gameId) => {
  const response = await api.get(`/order/match/${gameId}`);
  return response.data?.content || [];
};

// Place an order
const placeOrder = async (orderData) => {
  const response = await api.post(`/order`, orderData);
  const orderId = response.data.content.id;

  return getOrder(orderId);
};

// Get active orders for a game
const getActiveOrders = async (gameId) => {
  const response = await api.get(`/order/match/${gameId}`);
  //return response.data?.content?.filter(o => o.status_id == 1) || [];
  return response.data?.content || [];
};

// Get user orders history 
const getUserOrders = async () => {
  const response = await api.get(`/order/user/list`);
  return response.data?.content || [];
};

const paymentOrder = async (orderData) => {
  const response = await api.post(`/order/payment`, orderData);
  return response.data?.content || null;
};

// // Get order details
// const getOrderDetails = async (orderId) => {
//   // In a real app, this would be:
//   // const response = await api.get(`/orders/${orderId}`);
//   // return response.data?.content || null;
  
//   // For now, find the order in our mock data
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const order = localOrderHistory.find(o => o.id === orderId);
//       resolve(order || null);
//     }, 500);
//   });
// };

export default {
  placeOrder,
  getUserOrders,
  getActiveOrders,
  getMatchOrders,
  paymentOrder
}; 