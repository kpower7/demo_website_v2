# SCND Agent Web Application

A modern web-based supply chain optimization platform built with Next.js frontend and FastAPI backend, migrated from the original Streamlit application.

## 🚀 Quick Start (AI Hackathon Template)

These instructions run the Next.js site with Netlify Functions and the ElevenLabs real-time voice agent locally, and (optionally) start the FastAPI backend scaffold.

### Prerequisites
- Node.js 18+
- Python 3.10+ (for the optional FastAPI backend)
- Netlify CLI (recommended): `npm i -g netlify-cli`

### Environment
Create a `.env` file in the project root:
```
ELEVEN_API_KEY=your_elevenlabs_api_key
ELEVEN_AGENT_ID=your_elevenlabs_agent_id
# Optional (client-side convenience): used by /voice page in dev
NEXT_PUBLIC_ELEVEN_AGENT_ID=your_elevenlabs_agent_id
```

### Running Locally (Windows PowerShell)

#### Terminal 1 — Optional: FastAPI Backend
```powershell
cd "C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

#### Terminal 2 — Frontend + Netlify Functions
```powershell
cd "C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2"
npm install
npx netlify-cli@latest dev
#npx netlify-cli@latest dev --live
# If npx has cache/permission issues, install globally once:
# npm i -g netlify-cli && netlify dev
```

### Access Points
- Site: http://localhost:8888
- Voice coach (real-time): http://localhost:8888/voice
- Backend health (optional): http://127.0.0.1:8001/health

### Troubleshooting
- Socket error (WinError 10013): bind to `--host 127.0.0.1` and use a different port (`--port 8001`).
- npx EPERM/ECONNRESET: clear `"$env:LOCALAPPDATA\npm-cache\_npx"` or install `netlify-cli` globally.

## 📋 Application Overview

### Architecture
The SCND Agent web application follows a modern microservices architecture:

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and React-Leaflet
- **Backend**: FastAPI with Python, exposing REST APIs and WebSocket endpoints
- **Real-time Communication**: Native WebSocket connection for live updates
- **State Management**: Zustand for global state management
- **Map Visualization**: React-Leaflet for interactive supply chain maps

### Key Features

#### 1. Interactive Supply Chain Map
- **Technology**: React-Leaflet with OpenStreetMap tiles
- **Features**: 
  - Visual representation of plants (supply nodes) and demand centers
  - Color-coded markers based on capacity utilization
  - Flow lines showing transportation routes with different modes (Rail, Barge, Truck)
  - Interactive popups with detailed information
  - Real-time updates when optimization runs

#### 2. Supply Chain Optimization
- **Algorithm**: Linear programming using PuLP solver
- **Controls**:
  - Cost vs. Time balance slider (0-100%)
  - Custom constraints input
  - One-click optimization execution
  - Reset to baseline functionality
- **Real-time Results**: Live updates via WebSocket connection

#### 3. AI Chat Interface
- **Technology**: OpenAI GPT integration with function calling
- **Capabilities**:
  - Natural language supply chain modifications
  - Add/remove plants and demand centers
  - Update capacities, demands, and costs
  - Query current model state
  - Streaming responses for better UX

#### 4. Vehicle Routing (NYC Last-Mile Delivery)
- **Algorithms**: Nearest Neighbor and Greedy Savings
- **Features**:
  - NYC delivery node management
  - Vehicle capacity and constraint configuration
  - Route optimization and visualization
  - Performance metrics and comparison

#### 5. News Intelligence Pipeline
- **Data Sources**: News API integration
- **Features**:
  - Semiconductor industry news fetching
  - AI-powered scenario generation
  - Supply chain impact analysis
  - Optimization result comparison
  - Historical data storage with SQLite

## 🏗️ Technical Architecture

### Backend (FastAPI)

#### Core Modules
- `main.py` - FastAPI application with all endpoints
- `model.py` - Supply chain optimization model
- `chat_backend.py` - OpenAI integration and chat processing
- `vehicle_routing.py` - Vehicle routing algorithms
- `news_service.py` - News intelligence pipeline (optional)
- `automation_engine.py` - Automated analysis engine (optional)
- `database.py` - SQLite database management (optional)

#### API Endpoints

**Supply Chain Management**
- `GET /api/model/current` - Get current model state
- `GET /api/model/baseline` - Get baseline model state
- `POST /api/model/add-plant` - Add new plant
- `POST /api/model/add-demand-center` - Add demand center
- `POST /api/model/update-capacity` - Update plant capacity
- `POST /api/model/update-demand` - Update demand center demand
- `POST /api/model/update-costs` - Update transportation costs
- `POST /api/model/reset` - Reset to baseline

**Optimization**
- `POST /api/optimize` - Run supply chain optimization
- `GET /api/optimization/status` - Get optimization status

**Chat Interface**
- `POST /api/chat` - Process chat messages with AI

**Vehicle Routing**
- `GET /api/routing/nodes` - Get NYC delivery nodes
- `POST /api/routing/optimize` - Optimize vehicle routes

**News Intelligence** (Optional)
- `GET /api/news/articles` - Get cached news articles
- `GET /api/news/scenarios` - Get generated scenarios
- `GET /api/news/results` - Get optimization results
- `POST /api/news/analyze` - Run news analysis pipeline
- `GET /api/news/stats` - Get database statistics

**Real-time Communication**
- `WebSocket /ws` - Real-time updates and chat streaming

### Frontend (Next.js)

#### Project Structure
```
scnd-frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main dashboard
│   ├── components/          # React components
│   │   ├── chat/           # Chat interface components
│   │   ├── dashboard/      # Dashboard components
│   │   └── maps/           # Map visualization components
│   ├── hooks/              # Custom React hooks
│   │   └── useWebSocket.ts # WebSocket connection management
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # API client with Axios
│   │   └── utils.ts        # Utility functions
│   └── stores/             # State management
│       └── useSupplyChainStore.ts # Zustand store
├── package.json            # Dependencies and scripts
├── next.config.ts          # Next.js configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

#### Key Components

**SupplyChainMap** (`src/components/maps/SupplyChainMap.tsx`)
- Interactive map with React-Leaflet
- Renders plants, demand centers, and flow lines
- Handles map interactions and popups
- Real-time updates from WebSocket

**ChatInterface** (`src/components/chat/ChatInterface.tsx`)
- AI chat with streaming responses
- Message history management
- Integration with OpenAI API
- Real-time message updates

**OptimizationControls** (`src/components/dashboard/OptimizationControls.tsx`)
- Cost vs. time balance slider
- Constraints input field
- Optimization execution buttons
- Results display with metrics

#### State Management (Zustand)
```typescript
interface SupplyChainStore {
  // Model data
  currentModel: SupplyChainModel | null;
  baselineModel: SupplyChainModel | null;
  
  // Chat state
  chatMessages: ChatMessage[];
  isLoading: boolean;
  
  // UI state
  activeTab: string;
  isOptimizing: boolean;
  
  // WebSocket connection
  wsConnected: boolean;
  
  // Actions
  setCurrentModel: (model: SupplyChainModel) => void;
  addChatMessage: (message: ChatMessage) => void;
  setWsConnected: (connected: boolean) => void;
  // ... more actions
}
```

## 🔧 Configuration

### Backend Configuration

**FastAPI Settings** (`main.py`)
- CORS configuration for frontend integration
- WebSocket connection management
- Logging configuration
- Error handling middleware

**Model Configuration** (`model.py`)
- City coordinates for visualization
- Transportation modes and costs
- Capacity and demand constraints
- Optimization parameters

### Frontend Configuration

**Next.js Configuration** (`next.config.ts`)
- Static export configuration for deployment
- API proxy for development
- TypeScript and ESLint settings

**Tailwind Configuration** (`tailwind.config.ts`)
- Custom color schemes
- Component styling utilities
- Responsive breakpoints

## 🚀 Deployment

### Frontend Deployment (Netlify)
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `out` directory to Netlify
3. Configure environment variables in Netlify dashboard

### Backend Deployment Options
- **Heroku**: Use `Procfile` with `web: uvicorn main:app --host=0.0.0.0 --port=${PORT:-5000}`
- **AWS Lambda**: Use Mangum adapter for serverless deployment
- **Docker**: Create Dockerfile with Python and FastAPI
- **Railway/Render**: Direct deployment from Git repository

## 🧪 Testing

### Manual Testing Checklist
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] WebSocket connection establishes successfully
- [ ] Interactive map renders with supply chain data
- [ ] Optimization controls work and update map
- [ ] Chat interface responds to messages
- [ ] Real-time updates work via WebSocket

### API Testing
Use the FastAPI docs at http://localhost:8000/docs to test individual endpoints.

## 🔍 Troubleshooting

### Common Issues

**Backend Issues**
- **Import Errors**: Ensure all Python dependencies are installed
- **OpenAI API Errors**: Check API key configuration
- **Port Conflicts**: Change port in uvicorn command if 8000 is occupied

**Frontend Issues**
- **Map Not Loading**: Check if Leaflet CSS is properly imported
- **WebSocket Connection Failed**: Verify backend is running and WebSocket endpoint is accessible
- **Build Errors**: Check TypeScript errors and dependency versions

**WebSocket Issues**
- **Connection Refused**: Ensure backend WebSocket endpoint `/ws` is available
- **Frequent Disconnections**: Check network stability and firewall settings

### Debug Mode
Enable debug logging in the backend by setting log level to DEBUG in `main.py`.

## 📚 API Reference

### Supply Chain Model Structure
```typescript
interface SupplyChainModel {
  capacity: Record<string, number>;        // Plant capacities
  demand: Record<string, number>;          // Demand center demands
  coordinates: Record<string, [number, number]>; // Geographic coordinates
  flows: Record<string, number>;           // Optimized flows
  costs: Record<string, Record<string, number>>; // Transportation costs
  plant_totals: Record<string, number>;    // Plant utilization
  center_totals: Record<string, number>;   // Demand fulfillment
  total_cost: number;                      // Total optimization cost
  optimization_time: number;               // Solving time in seconds
}
```

### Chat Message Structure
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    function_calls?: any[];
    model_updates?: any[];
  };
}
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Make changes to backend (`main.py`, etc.) or frontend (`src/`)
3. Test locally with both services running
4. Submit pull request with description

### Code Style
- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use Prettier and ESLint configurations
- **TypeScript**: Strict mode enabled, proper type definitions

## 📄 License

This project is part of the MIT TPP SCND Agent research initiative.

## 📞 Support

For technical support or questions about the SCND Agent web application, please refer to the project documentation or contact the development team.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Python 3.8+, Node.js 18+
