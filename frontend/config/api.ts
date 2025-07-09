// API Configuration
// Toggle between 'development' and 'production'
const ENVIRONMENT = 'development' as 'development' | 'production';

const API_CONFIG = {
  development: {
    BASE_URL: 'https://winepoc.ngrok.io', // ngrok URL when testing    
    // BASE_URL: 'http://localhost:5001', // Testing localhost first
    NAME: 'Local Development'
  },
  production: {
    BASE_URL: 'https://your-domain.com', // Replace with your future production domain
    NAME: 'Production'
  }
};

// Export the current environment's config
export const API = API_CONFIG[ENVIRONMENT];

// Helper function to get full endpoint URL
export const getApiUrl = (endpoint: string) => {
  return `${API.BASE_URL}${endpoint}`;
};

// Log current environment (helpful for debugging)
if (__DEV__) {
  console.log(`🌐 API Environment: ${API.NAME} (${API.BASE_URL})`);
} 