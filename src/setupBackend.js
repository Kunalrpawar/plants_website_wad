import axios from 'axios';

// Check if backend is running
const setupBackend = async () => {
  try {
    // Try to connect to backend
    await axios.get('http://localhost:5000/api/plants');
    console.log('Backend is running');
  } catch (error) {
    console.error('Backend connection error:', error.message);
    // We can't start the backend from the browser, so show an informative message
    alert(`
      Unable to connect to the backend server!
      
      Please make sure the backend server is running:
      1. Open a terminal/command prompt
      2. Navigate to the 'backend' folder
      3. Run 'node server.js'
      
      Then refresh this page.
    `);
  }
};

export default setupBackend; 