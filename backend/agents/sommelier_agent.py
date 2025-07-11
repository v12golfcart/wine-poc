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

def get_wine_recommendations(wines: List[Dict[str, Any]], base64_image: str = None, mime_type: str = None) -> List[Dict[str, Any]]:
    """
    Provides sommelier recommendations for detected wines.
    
    Args:
        wines (List[Dict[str, Any]]): Array of detected wine objects from detection agent
        base64_image (str, optional): Base64 encoded image data for additional context
        mime_type (str, optional): MIME type of the image
    
    Returns:
        List[Dict[str, Any]]: Array of wine objects with added sommelier recommendations
    """
    # Load configuration
    config = load_prompts_config()
    if not config:
        raise ValueError("Failed to load prompts configuration from test_data/prompts.json")
    
    if not wines:
        return []
    
    # Get sommelier configuration
    sommelier_config = config.get("sommelier", {})
    if not sommelier_config:
        raise ValueError("No sommelier configuration found in prompts.json")
    
    prompt_template = sommelier_config["prompt_template"]
    sommelier_profile = sommelier_config["profile"]
    
    # Build wine list string for the prompt
    wine_list = json.dumps(wines, indent=2)
    
    # Build the dynamic prompt
    final_prompt = prompt_template.format(
        wine_list=wine_list,
        sommelier_profile=sommelier_profile
    )
    
    # Debug logging
    print(f"Sommelier agent: Processing {len(wines)} wines")
    
    # Define JSON schema for sommelier recommendations
    sommelier_schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "sommelier_recommendations",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "wines": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "wineries": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "name": {
                                    "type": "string"
                                },
                                "year": {
                                    "type": ["string", "null"]
                                },
                                "varietal": {
                                    "type": "string"
                                },
                                "region": {
                                    "type": ["string", "null"]
                                },
                                "recommendation": {
                                    "type": "object",
                                    "properties": {
                                        "rating": {
                                            "type": "integer"
                                        },
                                        "match_score": {
                                            "type": "integer"
                                        },
                                        "tasting_notes": {
                                            "type": "string"
                                        },
                                        "food_pairing": {
                                            "type": "string"
                                        },
                                        "why_recommended": {
                                            "type": "string"
                                        },
                                        "price_estimate": {
                                            "type": ["string", "null"]
                                        }
                                    },
                                    "required": ["rating", "match_score", "tasting_notes", "food_pairing", "why_recommended", "price_estimate"],
                                    "additionalProperties": False
                                }
                            },
                            "required": ["wineries", "name", "year", "varietal", "region", "recommendation"],
                            "additionalProperties": False
                        }
                    }
                },
                "required": ["wines"],
                "additionalProperties": False
            }
        }
    }

    try:
        # Prepare messages for OpenAI
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": final_prompt
                    }
                ]
            }
        ]
        
        # Add image if provided for additional context
        if base64_image and mime_type:
            messages[0]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime_type};base64,{base64_image}",
                    "detail": sommelier_config.get("detail", "low")
                }
            })
        
        sommelier_response = openai.chat.completions.create(
            model=sommelier_config["model"],
            max_tokens=sommelier_config["max_tokens"],
            temperature=sommelier_config["temperature"],
            response_format=sommelier_schema,
            messages=messages
        )
        
        ai_response = sommelier_response.choices[0].message.content.strip()
        
        if not ai_response:
            print("Sommelier agent: No AI response received")
            return wines  # Return original wines without recommendations
        
        # Parse JSON response
        try:
            response_data = json.loads(ai_response)
            
            # Extract wines array from structured response
            recommended_wines = response_data.get("wines", [])
            
            # Validate that it's an array
            if not isinstance(recommended_wines, list):
                print("Sommelier agent: Invalid response format (wines not array)")
                return wines  # Return original wines without recommendations
            
            return recommended_wines
            
        except json.JSONDecodeError as e:
            print(f"Sommelier agent: JSON parse error: {str(e)}")
            return wines  # Return original wines without recommendations
        
    except openai.OpenAIError as e:
        print(f"Sommelier agent OpenAI error: {str(e)}")
        return wines  # Return original wines without recommendations
    except Exception as e:
        print(f"Sommelier agent unexpected error: {str(e)}")
        return wines  # Return original wines without recommendations 