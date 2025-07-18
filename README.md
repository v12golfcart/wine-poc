# Wine Sommelier App - Prototype

## Product Description
AI-powered wine recommendation app that scans restaurant wine menus and provides personalized sommelier suggestions based on user preferences.

## Project Structure

```
wine-poc/
├── frontend/          # Expo/React Native app
│   ├── app/          # Expo Router pages
│   ├── components/   # React components
│   ├── services/     # API services
│   ├── assets/       # Images and static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Python Flask server
│   ├── main.py       # Flask application
│   └── requirements.txt # Python dependencies
└── README.md
```

## User Flow
1. **Camera** - Full-screen camera opens on app launch  
2. **Capture** - User photographs wine menu with instant preview
3. **AI Analysis** - Backend processes uploaded image using OpenAI Vision API:
   - Image description and content analysis
   - Future: Wine extraction and personalized recommendations
4. **Selection** - User browses wine list with AI notes, selects preference
5. **Activity** - Selected wines saved to personal history

## Core Features
- **Sommelier Tab**: Full-screen camera with instant image preview
- **Activity Tab**: Personal wine selection history
- **AI Integration**: Menu text extraction + personalized recommendations  
- **File Upload**: Modern multipart/form-data image processing
- **Real-time Processing**: Flask backend with OpenAI Vision API

## Technical Stack
- **Frontend**: Expo (React Native) - iOS focused
- **Camera**: expo-camera with React Native file upload
- **Backend**: Python Flask + OpenAI Vision API  
- **Database**: Future Supabase integration
- **AI**: OpenAI Vision API (gpt-4o-mini model)
- **Navigation**: Bottom tabs (Sommelier, Activity)

## Getting Started

### Frontend (Expo App)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Backend (Python Server)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Create a .env file in the backend directory
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "PORT=5001" >> .env
```

4. Start the Flask server:
```bash
python3 main.py
```

## Sommelier Profile (Hardcoded v1)
"Prefers full-bodied reds, enjoys Cabernet Sauvignon and Malbec, budget around $30-60, dislikes overly sweet wines"

## Development Focus
Simple prototype architecture - minimal nesting, core functionality first, expand features iteratively. 