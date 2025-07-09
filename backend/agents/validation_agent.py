import openai
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

def load_prompts_config():
    """Load prompts configuration from test_data/prompts.json"""
    try:
        config_path = os.path.join(os.path.dirname(__file__), '..', 'test_data', 'prompts.json')
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading prompts config: {e}")
        return None

def validate_wine_image(base64_image: str, mime_type: str) -> bool:
    """
    Validates if an image contains wine bottles, wine labels, or wine menu/wine list.
    
    Args:
        base64_image (str): Base64 encoded image data
        mime_type (str): MIME type of the image (e.g., 'image/jpeg')
    
    Returns:
        bool: True if image contains wine content, False otherwise
    """
    # Load configuration (let config errors bubble up)
    config = load_prompts_config()
    if not config:
        raise ValueError("Failed to load prompts configuration from test_data/prompts.json")
    
    validation_config = config["validation"]
    
    try:
        validation_response = openai.chat.completions.create(
            model=validation_config["model"],
            max_tokens=validation_config["max_tokens"],
            temperature=validation_config["temperature"],
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": validation_config["prompt"]
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}",
                                "detail": validation_config["detail"]
                            }
                        }
                    ]
                }
            ]
        )
        
        validation_result = validation_response.choices[0].message.content.strip().upper()
        
        # Return True if response starts with 'YES', False otherwise
        return bool(validation_result and validation_result.startswith('YES'))
        
    except openai.OpenAIError as e:
        # Log OpenAI errors and return False for safety
        print(f"Validation agent OpenAI error: {str(e)}")
        return False
    except Exception as e:
        # Log other unexpected errors and return False for safety
        print(f"Validation agent unexpected error: {str(e)}")
        return False 