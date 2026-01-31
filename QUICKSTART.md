# ResumeLens - Quick Start Guide

Get ResumeLens running in 5 minutes.

## 1. Get OpenRouter API Key (2 minutes)

1. Go to https://openrouter.ai
2. Sign up for a free account
3. Copy your API key from the dashboard

## 2. Setup Project (2 minutes)

```bash
# Clone/navigate to project
cd Resumelens

# Install all dependencies
npm run install:all

# Configure API key
# Edit backend/.env and set:
# LLM_API_KEY=your_api_key_here
```

## 3. Run Development Servers (1 minute)

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# App opens on http://localhost:3000
```

## 4. Test the App

1. Open http://localhost:3000 in your browser
2. Upload a resume (PDF or DOCX)
3. Choose evaluation mode (Job Description / Target Role / General)
4. Click "Check ATS Score"
5. View your AI-powered analysis and suggestions

## What You Get

- **ATS Score**: 0-100 rating
- **Dynamic Categories**: AI-generated scoring categories relevant to your resume
- **Detailed Breakdown**: Each category shows score, reasoning, strengths, and weaknesses
- **Red Flags**: Issues or unrealistic claims detected
- **Suggestions**: Specific improvements to boost your score

## Evaluation Modes

### Job Description
Upload your resume + paste a job description to get matched against it.

### Target Role
Select a role (Software Engineer, Data Scientist, etc.) and see how well your resume fits.

### General ATS
Get an overall resume quality score without specific context.

## API Endpoints (for developers)

```bash
# Health check
curl http://localhost:5000/api/health

# Get available roles
curl http://localhost:5000/api/roles

# Analyze resume (full flow)
curl -X POST http://localhost:5000/api/analyze \
  -F "resume=@resume.pdf" \
  -F "mode=general"
```

## Production Deployment

### Build
```bash
npm run build
```

### Deploy Frontend
Upload `frontend/dist/` to any static host (Vercel, Netlify, GitHub Pages, etc.)

### Deploy Backend
Deploy `backend/` to any Node.js host (Heroku, Railway, Render, etc.)

Remember to set `LLM_API_KEY` environment variable in production!

## Troubleshooting

**Port already in use?**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

**API calls failing?**
- Ensure backend is running on port 5000
- Check frontend proxy in `frontend/vite.config.js`
- Verify `ALLOWED_ORIGINS` in `backend/.env` includes localhost

**LLM API errors?**
- Double-check API key is correct
- Visit https://openrouter.ai to verify account and credits
- Try a different resume to isolate the issue

## Next Steps

- Read SETUP.md for detailed documentation
- Check README.md for architecture details
- View the original README for feature descriptions

Enjoy using ResumeLens!
