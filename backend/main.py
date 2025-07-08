from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenAI configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "wine-app-backend"})

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    """
    Analyze a base64 image using OpenAI Vision API
    Expects: {"image": "base64_string"}
    Returns: {"success": boolean, "description": string, "error"?: string}
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "description": "",
                "error": "No image provided"
            }), 400
        
        base64_image = data['image']
        
        if not base64_image:
            return jsonify({
                "success": False,
                "description": "",
                "error": "Empty image data"
            }), 400

        # Call OpenAI Vision API
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=500,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Please describe what you see in this image in detail. Focus on any text, menus, food items, or other relevant content."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "low"
                            }
                        }
                    ]
                }
            ]
        )
        
        description = response.choices[0].message.content
        
        if not description:
            return jsonify({
                "success": False,
                "description": "",
                "error": "No description returned from API"
            }), 500
        
        return jsonify({
            "success": True,
            "description": description.strip()
        })
        
    except openai.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        return jsonify({
            "success": False,
            "description": "",
            "error": f"OpenAI API error: {str(e)}"
        }), 500
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({
            "success": False,
            "description": "",
            "error": "Internal server error"
        }), 500

@app.route('/api/wine-recommendations', methods=['POST'])
def get_wine_recommendations():
    # This will be your wine processing endpoint
    # You can add additional wine processing logic here
    data = request.get_json()
    
    # TODO: Add your wine processing logic here
    # For now, return a placeholder response
    return jsonify({
        "message": "Wine recommendations endpoint",
        "received_data": data
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 