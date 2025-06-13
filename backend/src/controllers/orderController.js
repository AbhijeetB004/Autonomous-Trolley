const Order = require('../models/Order');
const { publish } = require('../services/mqttService');

// Get all orders (optionally filter by status)
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trolleyId, trolleyAssignment } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    if (trolleyId) order.trolleyId = trolleyId;
    if (trolleyAssignment) order.trolleyAssignment = trolleyAssignment;
    await order.save();

    // Publish MQTT command if order is assigned to trolley and status is in_progress
    if (status === 'in_progress' && order.trolleyId) {
      try {
        publish(`trolley/${order.trolleyId}/commands/order`, {
          messageType: 'ORDER_COMMAND',
          orderId: order.orderId,
          trolleyId: order.trolleyId,
          command: 'START_ORDER',
          payload: {
            items: order.items,
            route: order.trolleyAssignment?.route || [],
            estimatedTime: order.trolleyAssignment?.estimatedTime || null,
            priority: order.trolleyAssignment?.priority || 'normal',
          },
          timestamp: new Date().toISOString(),
        });
        console.log('Order command published to trolley', order.trolleyId);
      } catch (error) {
        console.error('Error publishing order command to trolley:', error);
        // Continue execution since MQTT failure shouldn't block order status update
      }
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Error updating order status', error: err.message });
  }
};

// Delete order (admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting order', error: err.message });
  }
};

// Customer: Create a new order
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    orderData.customerId = req.user.userId;
    // If trolleyId is present, set status to in_progress, else pending
    if (orderData.trolleyId) {
      orderData.status = 'in_progress';
    } else {
      orderData.status = 'pending';
    }
    const order = new Order(orderData);
    await order.save();

    // If trolleyId is present, publish order to MQTT
    if (order.trolleyId) {
      publish(`trolley/${order.trolleyId}/commands/order`, {
        messageType: 'ORDER_COMMAND',
        orderId: order.orderId,
        trolleyId: order.trolleyId,
        command: 'START_ORDER',
        payload: {
          items: order.items,
          route: order.trolleyAssignment?.route || [],
          estimatedTime: order.trolleyAssignment?.estimatedTime || null,
          priority: order.trolleyAssignment?.priority || 'normal',
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Error creating order', error: err.message });
  }
};

// Customer: Get all their orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user orders', error: err.message });
  }
};

// Customer: Get a specific order if it belongs to them
exports.getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customerId !== req.user.userId) return res.status(403).json({ message: 'Access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

// Customer: Assign a trolley to their order (after scanning QR)
// exports.assignTrolley = async (req, res) => {
//   try {
//     const { trolleyId } = req.body;
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     if (order.customerId !== req.user.userId) return res.status(403).json({ message: 'Access denied' });
//     order.trolleyId = trolleyId;
//     order.status = 'in_progress';
//     await order.save();

//     // Publish order details to the trolley's MQTT topic
//     publish(`trolley/${trolleyId}/commands/order`, {
//       messageType: 'ORDER_COMMAND',
//       orderId: order.orderId,
//       trolleyId: trolleyId,
//       command: 'START_ORDER',
//       payload: {
//         items: order.items,
//         route: order.trolleyAssignment?.route || [],
//         estimatedTime: order.trolleyAssignment?.estimatedTime || null,
//         priority: order.trolleyAssignment?.priority || 'normal',
//       },
//       timestamp: new Date().toISOString(),
//     });

//     res.json(order);
//   } catch (err) {
//     res.status(400).json({ message: 'Error assigning trolley', error: err.message });
//   }
// }; 