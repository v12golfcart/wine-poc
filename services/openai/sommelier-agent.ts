import { openai, OPENAI_CONFIG } from './client';
import type { ImageDescriptionResponse } from './types';

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

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
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
    });

    const description = response.choices[0]?.message?.content;

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
    
    return {
      success: false,
      description: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 