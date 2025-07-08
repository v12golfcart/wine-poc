from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "wine-app-backend"})

@app.route('/api/wine-recommendations', methods=['POST'])
def get_wine_recommendations():
    # This will be your wine processing endpoint
    # You can move your OpenAI logic here
    data = request.get_json()
    
    # TODO: Add your wine processing logic here
    # For now, return a placeholder response
    return jsonify({
        "message": "Wine recommendations endpoint",
        "received_data": data
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 