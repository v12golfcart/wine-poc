// Configuration constants for OpenAI API
export const OPENAI_CONFIG = {
  // Vision model for image analysis
  VISION_MODEL: 'gpt-4o-mini' as const,
  
  // Default parameters
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
} as const; 