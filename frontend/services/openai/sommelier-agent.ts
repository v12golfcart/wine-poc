import axios from 'axios';
import { OPENAI_CONFIG } from './client';
import type { ImageDescriptionResponse } from './types';

/**
 * Test general network connectivity first
 */
export async function testNetwork(): Promise<ImageDescriptionResponse> {
  try {
    console.log('Testing basic network connectivity with axios...');
    
    const response = await axios.get('https://httpbin.org/get', {
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000
    });

    console.log('Network test successful! IP:', response.data.origin);
    return {
      success: true,
      description: `Network test successful: ${response.data.origin || 'Connected'}`
    };

  } catch (error) {
    console.error('Network test failed:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        description: '',
        error: `Network error: ${error.message} (${error.code || 'unknown'})`
      };
    }
    return {
      success: false,
      description: '',
      error: error instanceof Error ? error.message : 'Network test failed'
    };
  }
}

/**
 * Test if we can reach OpenAI's domain at all
 */
export async function testOpenAIDomain(): Promise<ImageDescriptionResponse> {
  try {
    console.log('Testing OpenAI domain connectivity...');
    
    // Try to reach OpenAI's base domain
    const response = await axios.get('https://api.openai.com/', {
      timeout: 10000
    });

    console.log('OpenAI domain test successful! Status:', response.status);
    return {
      success: true,
      description: `OpenAI domain accessible: ${response.status}`
    };

  } catch (error) {
    console.error('OpenAI domain test failed:', error);
    if (axios.isAxiosError(error)) {
      console.log('Domain test error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      return {
        success: false,
        description: '',
        error: `OpenAI domain error: ${error.message} (${error.response?.status || error.code})`
      };
    }
    return {
      success: false,
      description: '',
      error: error instanceof Error ? error.message : 'Domain test failed'
    };
  }
}

/**
 * Test basic OpenAI connectivity with XMLHttpRequest (React Native native method)
 */
export async function testConnection(): Promise<ImageDescriptionResponse> {
  return new Promise((resolve) => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      console.log('Testing OpenAI connection with XMLHttpRequest...');
      console.log('API Key format check:', apiKey?.startsWith('sk-') ? 'Valid format' : 'Invalid format');
      console.log('API Key length:', apiKey?.length || 0);

      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', 'https://api.openai.com/v1/chat/completions', true);
      xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.timeout = 30000;
      
      xhr.onload = function() {
        console.log('XMLHttpRequest success! Status:', xhr.status);
        console.log('Response:', xhr.responseText);
        
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              description: `Connection test successful: ${data.choices?.[0]?.message?.content || 'No response'}`
            });
          } catch (parseError) {
            resolve({
              success: false,
              description: '',
              error: `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
            });
          }
        } else {
          resolve({
            success: false,
            description: '',
            error: `HTTP error: ${xhr.status} ${xhr.statusText}`
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('XMLHttpRequest error:', xhr.statusText);
        resolve({
          success: false,
          description: '',
          error: `Network error: ${xhr.statusText || 'Unknown error'}`
        });
      };
      
      xhr.ontimeout = function() {
        console.error('XMLHttpRequest timeout');
        resolve({
          success: false,
          description: '',
          error: 'Request timeout'
        });
      };

      const requestData = {
        model: 'gpt-3.5-turbo',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Say hello in one word.'
          }
        ]
      };

      console.log('Making XMLHttpRequest to OpenAI API...');
      xhr.send(JSON.stringify(requestData));

    } catch (error) {
      console.error('Connection test failed:', error);
      resolve({
        success: false,
        description: '',
        error: error instanceof Error ? error.message : 'Test failed'
      });
    }
  });
}

/**
 * AI Sommelier Agent - Image Description
 * Takes a base64 image and returns a description of what's in the image
 */
export async function describeImage(base64Image: string): Promise<ImageDescriptionResponse> {
  try {
    // Validate input
    if (!base64Image) {
      return {
        success: false,
        description: '',
        error: 'No image provided'
      };
    }

    // Debug logging
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    console.log('API Key available:', apiKey ? 'YES' : 'NO');
    console.log('Base64 image length:', base64Image.length);

    // Call OpenAI Vision API using fetch (React Native compatible)
    const requestBody = {
      model: OPENAI_CONFIG.VISION_MODEL,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      temperature: OPENAI_CONFIG.TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please describe what you see in this image. Be detailed and specific about any text, objects, or content visible.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ]
    };

    console.log('Making request to OpenAI with XMLHttpRequest...');
    
    const response = await new Promise<{data: any, status: number}>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', 'https://api.openai.com/v1/chat/completions', true);
      xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.timeout = 60000; // 60 second timeout for image analysis
      
      xhr.onload = function() {
        console.log('XMLHttpRequest success! Status:', xhr.status);
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({data, status: xhr.status});
          } catch (parseError) {
            reject(new Error(`Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`));
          }
        } else {
          reject(new Error(`HTTP error: ${xhr.status} ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = function() {
        console.error('XMLHttpRequest error:', xhr.statusText);
        reject(new Error(`Network error: ${xhr.statusText || 'Unknown error'}`));
      };
      
      xhr.ontimeout = function() {
        console.error('XMLHttpRequest timeout');
        reject(new Error('Request timeout'));
      };
      
      xhr.send(JSON.stringify(requestBody));
    });

    console.log('OpenAI image analysis successful!');
    const data = response.data;
    const description = data.choices?.[0]?.message?.content;

    if (!description) {
      return {
        success: false,
        description: '',
        error: 'No description received from AI'
      };
    }

    return {
      success: true,
      description: description.trim()
    };

  } catch (error) {
    console.error('Error describing image:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return {
      success: false,
      description: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 