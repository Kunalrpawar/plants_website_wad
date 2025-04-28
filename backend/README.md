# Plantee Backend Server

This is the backend server for the Plantee plant e-commerce application. It handles API requests for plants, orders, and contact form submissions.

## Getting Started

To start the backend server:

```bash
# From the project root
npm run start-backend

# OR directly from the backend folder
node server.js
```

## Database Setup

Before using the application, you should seed the database with initial plant data:

```bash
# From the project root
npm run seed-db

# To reset existing data and reseed
npm run seed-db -- --force
```

## Testing Orders

You can test if the order API is working correctly by running:

```bash
# From the project root
npm run test-order
```

This will simulate creating an order with a product from the database.

## API Endpoints

The server provides the following API endpoints:

- `/api/plants` - Plant data CRUD operations
- `/api/contact` - Contact form submissions
- `/api/orders` - Order processing and management

## MongoDB Connection

The server connects to MongoDB using the connection string in the `.env` file.

Make sure MongoDB is running and accessible at the specified URI.

## Requirements

- Node.js
- MongoDB
- NPM packages: express, mongoose, cors, dotenv, express-validator, axios 