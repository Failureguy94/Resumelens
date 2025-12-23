import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Validate if the uploaded document is actually a resume
 * @param {string} text - Extracted document text
 * @returns {Promise<Object>} - Validation result
 */
export async function validateResume(text) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key is required for AI-powered scoring. Please add it to your .env file.');
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a document classifier. Determine if the given text is a legitimate resume/CV or something else.

A valid resume contains:
- Professional experience, job history, or work background
- Education or academic qualifications
- Skills, competencies, or expertise
- Contact information or personal details
- Career-related information

NOT valid resumes:
- Recipes, cooking instructions
- Stories, novels, creative writing
- Random text, gibberish, jokes
- Product descriptions, advertisements
- Technical documentation (unless it's a tech writer's portfolio)
- Code snippets alone (unless part of a developer resume)

Respond with JSON only.`
                },
                {
                    role: 'user',
                    content: `Analyze this document and determine if it's a resume:\n\n${text.substring(0, 3000)}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 300
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return {
            isResume: result.isResume || false,
            confidence: result.confidence || 0,
            reason: result.reason || 'Unable to determine document type'
        };
    } catch (error) {
        console.error('Resume validation error:', error);

        // Handle specific OpenAI API errors
        if (error.status === 429 || error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your billing details or try again later.');
        } else if (error.status === 401 || error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API key. Please check your configuration.');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new Error('Unable to connect to OpenAI API. Please check your internet connection.');
        }

        throw new Error('Failed to validate document. Please try again.');
    }
}

/**
 * AI-powered resume scoring with dynamic categories
 * @param {string} resumeText - Resume content
 * @param {Object} evaluationParams - Job description, role, mode
 * @returns {Promise<Object>} - Comprehensive AI analysis
 */
export async function scoreResumeWithAI(resumeText, evaluationParams) {
    const { mode, jobDescription, targetRole } = evaluationParams;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key is required for AI-powered scoring. Please add it to your .env file.');
    }

    try {
        // Build context based on evaluation mode
        let contextInstruction = '';
        if (mode === 'job-description' && jobDescription) {
            contextInstruction = `Job Description:\n${jobDescription}\n\nEvaluate how well this resume matches the job requirements.`;
        } else if (mode === 'target-role' && targetRole) {
            contextInstruction = `Target Role: ${targetRole}\n\nEvaluate this resume for the ${targetRole} position.`;
        } else {
            contextInstruction = 'Evaluate this resume for general ATS compatibility and professional quality.';
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert ATS (Applicant Tracking System) and professional recruiter with deep knowledge of hiring across all industries.

Your task is to analyze resumes like a human recruiter would - understanding context, nuance, and quality beyond just keyword matching.

Key responsibilities:
1. **Comprehensive Analysis**: Read and understand every part of the resume
2. **Context Understanding**: Evaluate skills, experience, and achievements in context
3. **Quality Assessment**: Judge writing quality, clarity, and professionalism
4. **Absurdity Detection**: Flag unrealistic claims, inconsistencies, or red flags
5. **Dynamic Evaluation**: Create relevant scoring categories based on the resume content
6. **Actionable Feedback**: Provide specific, helpful improvement suggestions

Scoring Guidelines:
- 90-100: Exceptional resume, strong candidate
- 75-89: Good resume, qualified candidate
- 60-74: Decent resume, needs improvements
- 40-59: Weak resume, significant issues
- 0-39: Poor resume, major problems

Respond with JSON only, following the exact structure specified.`
                },
                {
                    role: 'user',
                    content: `${contextInstruction}

RESUME:
${resumeText}

Analyze this resume comprehensively and provide:
1. Overall ATS score (0-100)
2. Dynamic scoring categories (3-6 categories based on what matters for this resume)
3. Detected strengths and weaknesses
4. Red flags or concerns
5. Specific improvement suggestions
6. Overall summary

Respond in JSON format:
{
  "overallScore": <number 0-100>,
  "isValidResume": <boolean>,
  "categories": [
    {
      "name": "Category Name",
      "score": <0-100>,
      "weight": <0.1-1.0>,
      "reasoning": "Why this score",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"]
    }
  ],
  "redFlags": ["concern 1", "concern 2"],
  "keyStrengths": ["strength 1", "strength 2"],
  "improvementSuggestions": ["suggestion 1", "suggestion 2"],
  "summary": "Overall assessment in 2-3 sentences",
  "detectedAbsurdities": ["any unrealistic claims or issues"]
}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2000
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        // Ensure proper structure
        return {
            overallScore: Math.round(analysis.overallScore || 0),
            isValidResume: analysis.isValidResume !== false,
            categories: analysis.categories || [],
            redFlags: analysis.redFlags || [],
            keyStrengths: analysis.keyStrengths || [],
            improvementSuggestions: analysis.improvementSuggestions || [],
            summary: analysis.summary || 'Resume analyzed successfully.',
            detectedAbsurdities: analysis.detectedAbsurdities || [],
            metadata: {
                mode,
                targetRole: targetRole || 'general',
                scoringMethod: 'ai-powered',
                model: 'gpt-4'
            }
        };
    } catch (error) {
        console.error('AI scoring error:', error);

        // Handle specific OpenAI API errors
        if (error.status === 429 || error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your billing details or try again later.');
        } else if (error.status === 401 || error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API key. Please check your configuration.');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new Error('Unable to connect to OpenAI API. Please check your internet connection.');
        }

        throw new Error('Failed to analyze resume. Please try again or check your OpenAI API key.');
    }
}

/**
 * Generate formatted explanation from AI analysis
 * @param {Object} aiAnalysis - AI scoring result
 * @returns {string} - Natural language explanation
 */
export function formatAIExplanation(aiAnalysis) {
    const { overallScore, summary, keyStrengths, redFlags } = aiAnalysis;

    let explanation = `Your resume received an overall ATS score of ${overallScore}/100. ${summary}`;

    if (keyStrengths.length > 0) {
        explanation += `\n\nKey Strengths: ${keyStrengths.slice(0, 3).join(', ')}.`;
    }

    if (redFlags.length > 0) {
        explanation += `\n\nAreas of Concern: ${redFlags.slice(0, 2).join(', ')}.`;
    }

    return explanation;
}
