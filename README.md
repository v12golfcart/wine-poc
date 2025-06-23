# Wine Sommelier App - Prototype

## Product Description
AI-powered wine recommendation app that scans restaurant wine menus and provides personalized sommelier suggestions based on user preferences.

## User Flow
1. **Camera** - Full-screen camera opens on app launch
2. **Capture** - User photographs wine menu, confirms/retakes photo
3. **AI Analysis** - Two-stage OpenAI processing:
   - QA Agent: Validates image is a readable wine menu
   - Sommelier Agent: Extracts wines + provides 3 ranked recommendations
4. **Selection** - User browses wine list with AI notes, selects preference
5. **Activity** - Selected wines saved to personal history

## Core Features
- **Sommelier Tab**: Full-screen camera with Snapchat-style photo confirmation
- **Activity Tab**: Personal wine selection history
- **AI Integration**: Menu text extraction + personalized recommendations
- **Real-time Sync**: Supabase backend for data persistence

## Technical Stack
- **Frontend**: Expo (React Native) - iOS focused
- **Camera**: expo-camera with custom UI
- **Backend**: Supabase (database + future auth)
- **AI**: OpenAI API (dual-agent architecture)
- **Navigation**: Bottom tabs (Sommelier, Activity)

## Sommelier Profile (Hardcoded v1)
"Prefers full-bodied reds, enjoys Cabernet Sauvignon and Malbec, budget around $30-60, dislikes overly sweet wines"

## Development Focus
Simple prototype architecture - minimal nesting, core functionality first, expand features iteratively. 