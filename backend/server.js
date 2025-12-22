import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

import { parseResume } from './parsers/resumeParser.js';
import { calculateATSScore } from './scoring/scoreCalculator.js';
import { generateExplanation } from './ai/explanationGenerator.js';
import { getAvailableRoles } from './scoring/roleWeights.js';

// ES module path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000'
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
        }
    }
});

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Resume ATS Score Generator API is running' });
});

/**
 * Get available target roles
 */
app.get('/api/roles', (req, res) => {
    try {
        const roles = getAvailableRoles();
        res.json({ roles });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

/**
 * Upload and parse resume
 */
app.post('/api/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { path: filePath, mimetype } = req.file;

        // Parse resume text
        const resumeText = await parseResume(filePath, mimetype);

        // Clean up uploaded file
        await fs.unlink(filePath);

        res.json({
            success: true,
            resumeText,
            filename: req.file.originalname
        });
    } catch (error) {
        console.error('Upload error:', error);

        // Clean up file if it exists
        if (req.file?.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            error: error.message || 'Failed to process resume'
        });
    }
});

/**
 * Calculate ATS score
 */
app.post('/api/score', async (req, res) => {
    try {
        const { resumeText, mode, jobDescription, jobLink, targetRole } = req.body;

        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        if (!mode) {
            return res.status(400).json({ error: 'Evaluation mode is required' });
        }

        // Validate mode-specific requirements
        if (mode === 'job-description' && !jobDescription && !jobLink) {
            return res.status(400).json({
                error: 'Job description or job link is required for this mode'
            });
        }

        if (mode === 'target-role' && !targetRole) {
            return res.status(400).json({
                error: 'Target role is required for this mode'
            });
        }

        // For job link mode, use the job description (frontend should fetch/paste it)
        const effectiveJobDescription = jobDescription || '';

        // Calculate deterministic ATS score
        const scoreResult = calculateATSScore(resumeText, {
            mode,
            jobDescription: effectiveJobDescription,
            targetRole: targetRole || 'general'
        });

        res.json({
            success: true,
            scoreResult
        });
    } catch (error) {
        console.error('Scoring error:', error);
        res.status(500).json({
            error: error.message || 'Failed to calculate ATS score'
        });
    }
});

/**
 * Generate AI explanation
 */
app.post('/api/explain', async (req, res) => {
    try {
        const { scoreResult } = req.body;

        if (!scoreResult) {
            return res.status(400).json({ error: 'Score result is required' });
        }

        // Generate AI-powered explanation and suggestions
        const aiResult = await generateExplanation(scoreResult);

        res.json({
            success: true,
            ...aiResult
        });
    } catch (error) {
        console.error('Explanation error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate explanation'
        });
    }
});

/**
 * Combined endpoint: Upload, Score, and Explain in one call
 */
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { mode, jobDescription, targetRole } = req.body;
        const { path: filePath, mimetype } = req.file;

        // 1. Parse resume
        const resumeText = await parseResume(filePath, mimetype);

        // 2. Calculate score
        const scoreResult = calculateATSScore(resumeText, {
            mode,
            jobDescription: jobDescription || '',
            targetRole: targetRole || 'general'
        });

        // 3. Generate AI explanation
        const aiResult = await generateExplanation(scoreResult);

        // Clean up uploaded file
        await fs.unlink(filePath);

        res.json({
            success: true,
            scoreResult,
            explanation: aiResult.explanation,
            suggestions: aiResult.suggestions,
            generatedBy: aiResult.generatedBy
        });
    } catch (error) {
        console.error('Analysis error:', error);

        // Clean up file if it exists
        if (req.file?.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            error: error.message || 'Failed to analyze resume'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: error.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Resume ATS Score Generator API running on port ${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - GET  /api/health`);
    console.log(`   - GET  /api/roles`);
    console.log(`   - POST /api/upload`);
    console.log(`   - POST /api/score`);
    console.log(`   - POST /api/explain`);
    console.log(`   - POST /api/analyze (combined)`);
});
