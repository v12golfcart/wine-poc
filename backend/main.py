from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import tempfile
import time
from datetime import datetime, UTC
from dotenv import load_dotenv
import openai

# Import our agents
from agents.validation_agent import validate_wine_image
from agents.detection_agent import extract_wines

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenAI configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "wine-app-backend"})

@app.route('/analyze-image-file', methods=['POST'])
def analyze_image_file():
    """
    Analyze an uploaded image file using OpenAI Vision API
    Expects: multipart/form-data with 'image' field containing image file
    Returns: {"success": boolean, "description": string, "error"?: string}
    """
    temp_file_path = None
    try:
        # Check if image file is in request
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "description": "",
                "error": "No image file provided"
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "description": "",
                "error": "No image file selected"
            }), 400
        
        # Check file size (limit to 10MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if file_size > max_size:
            return jsonify({
                "success": False,
                "description": "",
                "error": f"File too large. Maximum size is {max_size // (1024*1024)}MB"
            }), 400
        
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            return jsonify({
                "success": False,
                "description": "",
                "error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            }), 400
        
        # Map file extensions to MIME types for OpenAI
        mime_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg', 
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp'
        }
        mime_type = mime_types.get(file_extension, 'image/jpeg')
        
        # Read file data
        file_data = file.read()
        
        if len(file_data) == 0:
            return jsonify({
                "success": False,
                "description": "",
                "error": "Uploaded file contains no data"
            }), 400
        
        # Create temporary file for cleanup purposes
        timestamp = int(time.time() * 1000)
        temp_file_path = os.path.join(tempfile.gettempdir(), f"uploaded_image_{timestamp}.{file_extension}")
        
        # Save to temp file
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_data)
        
        # Convert to base64 for OpenAI
        base64_image = base64.b64encode(file_data).decode('utf-8')
        
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
                                "url": f"data:{mime_type};base64,{base64_image}",
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
        return jsonify({
            "success": False,
            "description": "",
            "error": f"OpenAI API error: {str(e)}"
        }), 500
        
    except Exception as e:
        return jsonify({
            "success": False,
            "description": "",
            "error": "Internal server error"
        }), 500
    
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors

@app.route('/api/analyze-wine-image', methods=['POST'])
def analyze_wine_image():
    """
    Smart endpoint: Validates image contains wine, then extracts wine data
    Expects: multipart/form-data with 'image' field containing image file
    Returns: {"valid": boolean, "wines": array, "error"?: string, "message"?: string}
    """
    timestamp = datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]
    print(f"[{timestamp}] REQUEST: /api/analyze-wine-image)")
    
    temp_file_path = None
    try:
        # Check if image file is in request
        if 'image' not in request.files:
            return jsonify({
                "valid": False,
                "wines": [],
                "error": "No image file provided"
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                "valid": False,
                "wines": [],
                "error": "No image file selected"
            }), 400
        
        # Check file size (limit to 10MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if file_size > max_size:
            return jsonify({
                "valid": False,
                "wines": [],
                "error": f"File too large. Maximum size is {max_size // (1024*1024)}MB"
            }), 400
        
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            return jsonify({
                "valid": False,
                "wines": [],
                "error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            }), 400
        
        # Map file extensions to MIME types for OpenAI
        mime_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg', 
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp'
        }
        mime_type = mime_types.get(file_extension, 'image/jpeg')
        
        # Read file data
        file_data = file.read()
        
        if len(file_data) == 0:
            return jsonify({
                "valid": False,
                "wines": [],
                "error": "Uploaded file contains no data"
            }), 400
        
        # Create temporary file for cleanup purposes
        timestamp = int(time.time() * 1000)
        temp_file_path = os.path.join(tempfile.gettempdir(), f"wine_analysis_{timestamp}.{file_extension}")
        
        # Save to temp file
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_data)
        
        # Convert to base64 for OpenAI
        base64_image = base64.b64encode(file_data).decode('utf-8')
        
        # STEP 1: Quick validation (cheap)
        is_valid = validate_wine_image(base64_image, mime_type)
        
        if not is_valid:
            timestamp = datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]
            print(f"[{timestamp}] RESPONSE: FAIL - Invalid image (not wine content)")
            return jsonify({
                "valid": False,
                "wines": [],
                "message": "Image must contain wine bottles or a wine menu"
            })
        
        # STEP 2: Wine detection (more expensive, but only if validation passed)
        wines = extract_wines(base64_image, mime_type)
        
        if not wines:
            timestamp = datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]
            print(f"[{timestamp}] RESPONSE: FAIL - No wines detected")
            return jsonify({
                "valid": True,
                "wines": [],
                "error": "No wines could be detected in the image"
            })
        
        timestamp = datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]
        print(f"[{timestamp}] RESPONSE: SUCCESS - Found {len(wines)} wines")
        return jsonify({
            "valid": True,
            "wines": wines
        })
        
    except openai.OpenAIError as e:
        timestamp = datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]
        print(f"[{timestamp}] RESPONSE: ERROR - OpenAI API: {str(e)}")
        return jsonify({
            "valid": False,
            "wines": [],
            "error": f"OpenAI API error: {str(e)}"
        }), 500
        
    except Exception as e:
        timestamp = datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]
        print(f"[{timestamp}] RESPONSE: ERROR - Internal: {str(e)}")
        return jsonify({
            "valid": False,
            "wines": [],
            "error": "Internal server error"
        }), 500
    
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors


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