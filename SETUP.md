# ResumeLens - Setup & Deployment Guide

## Project Overview

ResumeLens is an AI-powered resume ATS score generator that analyzes resumes and provides:
- **AI-powered scoring** using Gemini 2.0 Flash (via OpenRouter)
- **Dynamic evaluation categories** (categories are generated based on resume content)
- **Detailed breakdown** of strengths, weaknesses, and red flags
- **Actionable suggestions** for improvement

## Architecture

```
ResumeLens/
├── backend/              # Node.js/Express API
│   ├── server.js         # Main server file
│   ├── parsers/          # PDF/DOCX parsing
│   ├── scoring/          # Scoring logic
│   ├── ai/               # AI integration (OpenRouter)
│   └── .env              # Environment configuration
│
└── frontend/             # React + Vite
    ├── src/
    │   ├── components/   # React components
    │   ├── App.jsx       # Main app component
    │   └── main.jsx      # Entry point
    └── index.html        # HTML entry point
```

## Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenRouter API Key** (for AI-powered scoring) - Get one free at https://openrouter.ai

## Installation

### 1. Install All Dependencies

From the root directory:

```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Backend (`backend/`)
- Frontend (`frontend/`)

### 2. Configure Environment Variables

Edit `/backend/.env`:

```env
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
MAX_FILE_SIZE=10485760
LLM_API_KEY=your_openrouter_api_key_here
```

**How to get OpenRouter API Key:**
1. Visit https://openrouter.ai
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Paste it in `.env` as `LLM_API_KEY`

## Development Mode

### Start Backend (Terminal 1)

```bash
npm run dev:backend
```

The backend will run on `http://localhost:5000`

### Start Frontend (Terminal 2)

```bash
npm run dev:frontend
```

The frontend will run on `http://localhost:3000`

The Vite config includes a proxy that automatically routes API calls from `/api/*` to the backend.

## Production Build

```bash
npm run build
```

This creates an optimized production build in `frontend/dist/`

## API Endpoints

### Health Check
```
GET /api/health
```

### Get Available Roles
```
GET /api/roles
Response: { "roles": [{ "key": "software-engineer", "name": "Software Engineer" }, ...] }
```

### Analyze Resume (Complete Flow)
```
POST /api/analyze
Content-Type: multipart/form-data

Body:
- resume: File (PDF or DOCX)
- mode: "job-description" | "target-role" | "general"
- jobDescription: string (if mode is "job-description")
- targetRole: string (if mode is "target-role")

Response:
{
  "scoreResult": {
    "overallScore": 75,
    "categories": [
      {
        "name": "Keyword Relevance",
        "score": 80,
        "weight": 0.35,
        "reasoning": "...",
        "strengths": [...],
        "weaknesses": [...]
      },
      ...
    ],
    "keyStrengths": [...],
    "redFlags": [...],
    "detectedAbsurdities": [...],
    "summary": "..."
  },
  "explanation": "Your resume received...",
  "suggestions": [...],
  "generatedBy": "openai-gpt4-ai-scoring"
}
```

## Features

### 1. Resume Upload
- Supports PDF and DOCX formats
- Max file size: 10MB
- Drag-and-drop or click to upload

### 2. Evaluation Modes

**Job Description Mode**
- Upload your resume
- Paste a job description
- Get score matched to that specific job

**Target Role Mode**
- Select from predefined roles:
  - Software Engineer
  - Data Scientist
  - Product Manager
  - Frontend Developer
  - Backend Developer
  - UI/UX Designer
  - DevOps Engineer

**General ATS Mode**
- Get overall resume quality score

### 3. AI Analysis
- **Dynamic Categories**: AI creates relevant scoring categories based on your resume
- **Contextual Scoring**: Each category gets a score, weight, reasoning, and detailed feedback
- **Red Flags**: Detects unrealistic claims, formatting issues, or inconsistencies
- **Improvement Suggestions**: Specific, actionable recommendations

## How the Scoring Works

1. **Resume Validation**: AI checks if the uploaded document is actually a resume
2. **Content Analysis**: AI reads and understands the resume in context
3. **Dynamic Categorization**: AI creates 3-6 relevant scoring categories
4. **Category Scoring**: Each category is scored 0-100 based on quality and relevance
5. **Overall Score**: Weighted average of all categories
6. **Detailed Feedback**: Strengths, weaknesses, and improvement suggestions

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub to Vercel
3. Set environment variable `LLM_API_KEY` in Vercel dashboard
4. Deploy both frontend and backend as separate projects

### Option 2: Self-Hosted

**Backend (Node.js)**:
```bash
cd backend
npm install
NODE_ENV=production node server.js
```

**Frontend (Static Build)**:
```bash
cd frontend
npm install
npm run build
# Serve the `dist/` folder with any static server (nginx, Apache, etc.)
```

### Option 3: Docker

Create `Dockerfile` in root:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm run install:all
RUN npm run build
EXPOSE 5000 3000
CMD ["npm", "run", "dev:backend"]
```

## Troubleshooting

### "Vite command not found"
Make sure to run `npm run install:all` from root to install frontend dependencies.

### API calls failing
Ensure backend is running on port 5000 and frontend proxy is configured correctly in `vite.config.js`.

### LLM API errors
- Check that `LLM_API_KEY` is set in `.env`
- Verify API key is valid at https://openrouter.ai
- Check OpenRouter account has credits/quota

### CORS errors
Ensure `ALLOWED_ORIGINS` in `.env` includes your frontend URL.

## Performance Optimization

- Frontend: Uses React + Vite for fast development and optimized production builds
- Backend: Streams large file uploads, uses memory storage for temporary processing
- Resume parsing: Extracts text efficiently from PDF/DOCX without rendering

## Security

- No user data is stored
- Resumes are processed in-memory and deleted immediately after analysis
- CORS configured to allow only specified origins
- File uploads limited to 10MB
- Supports only PDF and DOCX formats

## Support & Issues

For issues or questions:
1. Check this guide first
2. Review the README.md in the project root
3. Check backend logs for API errors
4. Verify environment configuration

## License

MIT
