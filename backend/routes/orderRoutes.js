const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Test endpoint to verify backend is working
router.get('/test', (req, res) => {
  res.json({ message: 'Order routes are working' });
});

// Create new order - simplified version
router.post('/', async (req, res) => {
  try {
    console.log('Received order data:', JSON.stringify(req.body));
    
    // Basic validation
    if (!req.body.user || !req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ message: 'Invalid order format. Must include user and items array.' });
    }

    // Process the items to handle numeric plant IDs
    const processedOrder = { ...req.body };
    const allPlants = await Plant.find();
    
    if (allPlants.length === 0) {
      return res.status(404).json({ message: 'No plants found in database' });
    }
    
    console.log(`Found ${allPlants.length} plants in database`);
    
    // Map items to use proper plant IDs
    processedOrder.items = await Promise.all(req.body.items.map(async (item) => {
      let plant;
      
      // Try to find plant by ID or numeric position
      if (mongoose.Types.ObjectId.isValid(item.plant)) {
        plant = await Plant.findById(item.plant);
      } else {
        // Handle numeric IDs by finding the plant at that index in the array
        // or by searching for a plant with matching numeric ID
        const plantId = parseInt(item.plant);
        if (!isNaN(plantId) && plantId > 0 && plantId <= allPlants.length) {
          plant = allPlants[plantId - 1]; // Array is 0-indexed
        } else {
          // Try to find by name if nothing else works
          plant = allPlants.find(p => p.name.toLowerCase().includes(item.plant.toLowerCase()));
        }
      }
      
      if (!plant) {
        throw new Error(`Plant with ID ${item.plant} not found`);
      }
      
      console.log(`Found plant: ${plant.name}`);
      
      // Update stock
      if (plant.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${plant.name}`);
      }
      
      plant.stockQuantity -= item.quantity;
      await plant.save();
      
      return {
        plant: plant._id,
        quantity: item.quantity,
        price: item.price
      };
    }));

    const order = new Order(processedOrder);
    const newOrder = await order.save();
    
    console.log('Created new order:', newOrder._id);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.plant').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.plant');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = req.body.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 