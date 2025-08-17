/**
 * Environment configuration utility
 * 
 * In Expo, environment variables must be prefixed with EXPO_PUBLIC_ 
 * to be available in the client-side code.
 */

export const ENV = {
    // Google Cloud API Key
    GOOGLE_CLOUD_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
    
    // Vision AI endpoints (replace with your actual endpoints when ready)
    VISION_API_URL: process.env.EXPO_PUBLIC_VISION_API_URL || 'https://your-vision-api.com',
    VISION_API_KEY: process.env.EXPO_PUBLIC_VISION_API_KEY || 'your-api-key',
};

// Helper function to check if required environment variables are set
export const validateEnv = () => {
    if (!ENV.GOOGLE_CLOUD_API_KEY) {
        console.warn('Warning: GOOGLE_CLOUD_API_KEY environment variable is not set');
    }
    if (!ENV.VISION_API_URL || ENV.VISION_API_URL === 'https://your-vision-api.com') {
        console.warn('Warning: VISION_API_URL environment variable is not set');
    }
};

// Check environment variables on import
if (__DEV__) {
    validateEnv();
}
