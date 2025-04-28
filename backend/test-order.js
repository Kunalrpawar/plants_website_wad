require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Plant = require('./models/Plant');

// Connect to database
const testOrder = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Get plants from database
    const plants = await Plant.find().limit(2);
    
    if (plants.length === 0) {
      console.error('No plants found in database. Please run seed.js first.');
      process.exit(1);
    }
    
    // Create a test order
    const testOrderData = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        address: '123 Test St, Test City, TS 12345'
      },
      items: [
        {
          plant: plants[0]._id.toString(), // Use the first plant
          quantity: 1,
          price: plants[0].price
        }
      ],
      totalAmount: plants[0].price,
      status: 'pending'
    };
    
    console.log('Sending test order:', JSON.stringify(testOrderData, null, 2));
    
    // Send test order
    const response = await axios.post('http://localhost:5000/api/orders', testOrderData);
    
    console.log('Order creation successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Test failed:');
    console.error(error.response ? error.response.data : error.message);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
};

// Run the test
testOrder(); 