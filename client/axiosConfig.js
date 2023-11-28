import axios from 'axios';

// Create an instance of Axios with a custom configuration
const instance = axios.create({
  // Set the base URL for requests
  baseURL: 'http://localhost:4000',
});

// Set withCredentials for the instance
instance.defaults.withCredentials = true;

// Export the configured instance for use in other parts of the application
export default instance;
