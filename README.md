# ResumeLens - ATS Score Generator

A production-ready Resume ATS Score Generator that provides **deterministic, explainable scoring** with AI-powered suggestions. Built with clear separation between rule-based scoring logic and AI-generated explanations.

## 🌟 Features

- **Deterministic ATS Scoring**: Transparent, reproducible scoring using classical NLP (TF-IDF, cosine similarity)
- **Role-Aware Evaluation**: Soft weighting system for core, transferable, and peripheral skills
- **Three Evaluation Modes**:
  1. Job Description / Job Link
  2. Target Role (Software Engineer, Data Scientist, Product Manager, etc.)
  3. General ATS Score
- **AI-Powered Suggestions**: GenAI strictly limited to explaining scores and suggesting improvements
- **Modern React UI**: Clean, responsive interface with smooth animations
- **Stateless & Private**: No authentication, no storage - instant analysis

## 🏗️ Architecture

```
Resumelens/
├── backend/
│   ├── server.js              # Express API server
│   ├── parsers/
│   │   └── resumeParser.js    # PDF/DOCX text extraction
│   ├── scoring/
│   │   ├── sectionDetector.js # Resume section identification
│   │   ├── formattingChecker.js # ATS format validation
│   │   ├── keywordExtractor.js # TF-IDF & cosine similarity
│   │   ├── roleWeights.js     # Role-aware weighting system
│   │   └── scoreCalculator.js # Main deterministic scorer
│   └── ai/
│       └── explanationGenerator.js # GenAI explanations only
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LandingPage.jsx    # Upload & mode selection
    │   │   ├── ScoreResults.jsx   # Score visualization
    │   │   ├── ScoreCard.jsx      # Category breakdown
    │   │   └── FileUpload.jsx     # Drag & drop upload
    │   ├── App.jsx
    │   └── index.css              # Design system
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env and add your OpenAI API key (optional - has fallback)
# OPENAI_API_KEY=your_api_key_here

# Start the server
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables (Backend)

Create a `.env` file in the `backend` directory:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
MAX_FILE_SIZE=10485760
```

**Note**: OpenAI API key is optional. The system has a fallback explanation generator if the API is unavailable.

## 📊 How It Works

### Deterministic Scoring Engine

The ATS score is calculated using a **transparent, reproducible formula**:

```
Final Score = 
  Keyword Relevance (35%) +
  Role Alignment (30%) +
  Resume Structure (20%) +
  ATS Formatting (15%)
```

#### 1. Keyword Relevance (0-100)
- Uses **TF-IDF** to extract important keywords
- Calculates **cosine similarity** between resume and job description
- Combines keyword overlap (60%) and similarity (40%)

#### 2. Role Alignment (0-100)
- **Soft weighting** based on target role:
  - **Core skills**: 0.6-0.8 weight
  - **Transferable skills**: 0.3-0.5 weight
  - **Peripheral skills**: 0.1-0.2 weight
- Transferable skills **add value** but **never outweigh** missing core skills

#### 3. Resume Structure (0-100)
- Detects sections using regex patterns
- Required sections: Education, Experience, Skills (20 points each)
- Optional sections: Summary, Projects, Achievements, Certifications (10 points each)

#### 4. ATS Formatting (0-100)
- Checks for parsing issues:
  - Tables (-15 points)
  - Multi-column layouts (-15 points)
  - Excessive special characters (-10 points)
  - Non-standard bullets (-5 points)
  - All-caps overuse (-5 points)

### GenAI Integration (Strictly Limited)

GenAI is **ONLY** used for:
1. Explaining the deterministic score in natural language
2. Suggesting specific improvements
3. Encouraging users without discouraging

GenAI **NEVER**:
- Generates scores
- Adjusts weights
- Overrides deterministic results

## 🎯 API Endpoints

### `GET /api/health`
Health check endpoint

### `GET /api/roles`
Get available target roles

### `POST /api/upload`
Upload and parse resume (PDF/DOCX)

### `POST /api/score`
Calculate ATS score with breakdown

### `POST /api/explain`
Generate AI explanation for score

### `POST /api/analyze`
Combined endpoint: upload + score + explain

## 🎨 Technology Stack

### Backend
- **Node.js** with Express
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX parsing  
- **natural** - NLP library (TF-IDF, tokenization)
- **OpenAI SDK** - AI explanations (optional)

### Frontend
- **React 18** with hooks
- **Vite** - Fast development
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Modern CSS** - Glassmorphism, gradients, animations

## 🔐 Privacy & Security

- **No Authentication**: Stateless design, no user accounts
- **No Storage**: Resumes are processed in-memory and deleted immediately
- **No Tracking**: No analytics, no cookies
- **CORS Enabled**: Configurable allowed origins

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using deterministic scoring and responsible AI