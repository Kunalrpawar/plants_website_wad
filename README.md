# Plantee - Plant E-commerce Website

A modern e-commerce website for plants with MongoDB integration for product listings, cart functionality, checkout process, and a live plant assistant chatbot powered by Google's Gemini 2.0 Flash AI.

## Features

- Product browsing with category filtering
- Shopping cart functionality
- Secure checkout process
- Contact form
- Plant assistant chatbot with AI responses
- MongoDB database integration
- Dark/light theme toggle

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server (in a separate terminal):
   ```bash
   npm run start-backend
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```

## Database Setup

The application uses MongoDB to store:
- Plants data
- Order information
- Contact form submissions

Make sure your MongoDB connection string is properly set in the `.env` file:
```
MONGO_URI=your_mongodb_connection_string
```

## Chatbot Configuration

The plant assistant chatbot uses Google's Gemini 2.0 Flash AI. Make sure your API key is configured in the root `.env` file:
```
REACT_APP_GOOGLE_API_KEY=your_google_api_key
```

## Database Collections

- `plants` - Stores all plant data
- `orders` - Stores order information and status
- `contacts` - Stores contact form submissions

## Folder Structure

- `/src` - Frontend React application
- `/backend` - Backend Express server and MongoDB integration
- `/public` - Static assets

## Technologies Used

- React
- TypeScript
- MongoDB
- Express.js
- Google Gemini AI
- Node.js
