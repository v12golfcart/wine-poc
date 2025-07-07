import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// Configuration constants
export const OPENAI_CONFIG = {
  // Vision model for image analysis
  VISION_MODEL: 'gpt-4o-mini' as const,
  
  // Default parameters
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
} as const;

// Export the configured client
export { openai }; 