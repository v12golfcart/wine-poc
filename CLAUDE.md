# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AI-powered wine recommendation app that analyzes wine menu photos and provides personalized sommelier suggestions using GPT-4o-mini vision capabilities.

## Architecture
- **Frontend**: React Native/Expo app in `/frontend/`
- **Backend**: Python Flask API in `/backend/` with OpenAI Vision integration
- **Communication**: REST API with CORS support

## Essential Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm start           # Start Expo dev server
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt    # Install dependencies
python3 main.py                   # Start Flask server (port 5001)
```

### Testing
```bash
cd backend
python3 test_runner.py           # Run automated tests
```

## Key Implementation Details

### API Configuration
- Frontend API endpoint configured in `frontend/config/api.ts`
- Backend requires `.env` file with `OPENAI_API_KEY` and `PORT=5001`
- For local testing, use ngrok and update API endpoint

### Core Workflow
1. **Image Capture**: Camera tab (`frontend/app/(tabs)/index.tsx`)
2. **AI Processing**: Three-agent pipeline in backend:
   - `validation_agent.py`: Verify wine content
   - `detection_agent.py`: Extract wine data
   - `sommelier_agent.py`: Generate recommendations
3. **Results Display**: `frontend/app/recommendations.tsx`

### AI Prompts Configuration
Prompts are centralized in `backend/test_data/prompts.json` with three sections:
- `validation_prompt`: Image validation criteria
- `detection_prompt`: Wine extraction rules
- `sommelier_prompt`: Recommendation generation

### Key API Endpoint
`POST /api/analyze-wine-image`
- Accepts: Base64 encoded image
- Returns: Validation status, extracted wines, and AI recommendations

## Development Notes
- User preferences are currently hardcoded in the sommelier prompt
- Images are temporarily saved in `backend/temp_images/` for faster processing
- The app uses tab navigation with Camera and Activity sections
- TypeScript is enabled for frontend development