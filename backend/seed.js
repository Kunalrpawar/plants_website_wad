require('dotenv').config();
const mongoose = require('mongoose');
const Plant = require('./models/Plant');
const connectDB = require('./config/db');

// Sample plant data
const plantData = [
  {
    name: 'Monstera Deliciosa',
    description: 'The Swiss Cheese Plant, known for its iconic split leaves.',
    price: 29.99,
    imageUrl: '/assets/img/product1.png',
    category: 'Indoor',
    stockQuantity: 10
  },
  {
    name: 'Snake Plant',
    description: 'Low-maintenance plant that purifies air and thrives in most conditions.',
    price: 19.99,
    imageUrl: '/assets/img/product2.png',
    category: 'Indoor',
    stockQuantity: 15
  },
  {
    name: 'Peace Lily',
    description: 'Elegant flowering plant that removes toxins from the air.',
    price: 24.99,
    imageUrl: '/assets/img/product3.png',
    category: 'Indoor',
    stockQuantity: 8
  },
  {
    name: 'Fiddle Leaf Fig',
    description: 'Popular houseplant with large, violin-shaped leaves.',
    price: 49.99,
    imageUrl: '/assets/img/product4.png',
    category: 'Indoor',
    stockQuantity: 5
  },
  {
    name: 'Aloe Vera',
    description: 'Medicinal plant with thick, fleshy leaves filled with gel.',
    price: 15.99,
    imageUrl: '/assets/img/product5.png',
    category: 'Succulent',
    stockQuantity: 20
  },
  {
    name: 'Boston Fern',
    description: 'Lush and feathery fronds that add a tropical touch to any space.',
    price: 22.99,
    imageUrl: '/assets/img/product6.png',
    category: 'Indoor',
    stockQuantity: 12
  }
];

// Connect to database and seed data
const seedPlants = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Check if plants collection already has data
    const count = await Plant.countDocuments();
    if (count > 0) {
      console.log(`Plants collection already has ${count} documents`);
      console.log('To reseed, run: node seed.js --force');
      
      // If --force flag is provided, delete existing plants
      if (process.argv.includes('--force')) {
        await Plant.deleteMany({});
        console.log('Existing plants deleted');
      } else {
        mongoose.disconnect();
        return;
      }
    }
    
    // Insert plant data
    const plants = await Plant.insertMany(plantData);
    console.log(`${plants.length} plants inserted successfully`);
    
    // List inserted plants
    plants.forEach((plant, index) => {
      console.log(`${index + 1}. ${plant.name} (ID: ${plant._id})`);
    });
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedPlants(); 