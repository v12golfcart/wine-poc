// Response type for image description
export interface ImageDescriptionResponse {
  success: boolean;
  description: string;
  error?: string;
}

// Common error types
export interface OpenAIError {
  message: string;
  type: 'api_error' | 'network_error' | 'validation_error';
} 