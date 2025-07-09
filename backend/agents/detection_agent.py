import openai
import os
import json
from typing import List, Dict, Any
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

def extract_wines(base64_image: str, mime_type: str) -> List[Dict[str, Any]]:
    """
    Extracts wine information from an image and returns structured wine data.
    
    Args:
        base64_image (str): Base64 encoded image data
        mime_type (str): MIME type of the image (e.g., 'image/jpeg')
    
    Returns:
        List[Dict[str, Any]]: Array of wine objects with structured data
    """
    # Load configuration (let config errors bubble up)
    config = load_prompts_config()
    if not config:
        raise ValueError("Failed to load prompts configuration from test_data/prompts.json")
    
    # Load arrays and template from config
    varietals = config.get("varietals", [])
    if not varietals:
        raise ValueError("No varietals found in prompts configuration")
    
    prompt_template = config["detection"]["prompt_template"]
    detection_config = config["detection"]
    
    # Build the dynamic prompt
    varietals_list = ", ".join(varietals)
    final_prompt = prompt_template.format(
        varietals_list=varietals_list
    )
    
    # Debug logging
    print(f"Detection agent: Using {len(varietals)} varietals")
    
    try:
        detection_response = openai.chat.completions.create(
            model=detection_config["model"],
            max_tokens=detection_config["max_tokens"],
            temperature=detection_config["temperature"],
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": final_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}",
                                "detail": detection_config["detail"]
                            }
                        }
                    ]
                }
            ]
        )
        
        ai_response = detection_response.choices[0].message.content.strip()
        
        if not ai_response:
            print("Detection agent: No AI response received")
            return []
        
        # Parse JSON response
        try:
            wines = json.loads(ai_response)
            
            # Validate that it's an array
            if not isinstance(wines, list):
                print("Detection agent: Invalid response format (not array)")
                return []
            
            return wines
            
        except json.JSONDecodeError as e:
            print(f"Detection agent: JSON parse error: {str(e)}")
            return []
        
    except openai.OpenAIError as e:
        print(f"Detection agent OpenAI error: {str(e)}")
        return []
    except Exception as e:
        print(f"Detection agent unexpected error: {str(e)}")
        return [] 