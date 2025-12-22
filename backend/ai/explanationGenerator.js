import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate natural language explanation using GenAI
 * STRICTLY LIMITED: GenAI only explains scores, never generates or modifies them
 * 
 * @param {Object} scoreResult - Deterministic score result from scoreCalculator
 * @returns {Promise<Object>} - AI-generated explanations and suggestions
 */
export async function generateExplanation(scoreResult) {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        return generateFallbackExplanation(scoreResult);
    }

    try {
        const prompt = buildPrompt(scoreResult);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful career coach explaining ATS resume scores. 
Your role is ONLY to:
1. Explain why the user received their score based on the breakdown provided
2. Suggest specific improvements
3. Encourage the user without being discouraging

You MUST NOT:
- Generate scores
- Modify weights
- Override any deterministic results

Be concise, specific, and encouraging. Focus on actionable advice.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        const explanation = completion.choices[0].message.content;

        // Generate specific suggestions
        const suggestionsPrompt = buildSuggestionsPrompt(scoreResult);

        const suggestionsCompletion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a resume expert. Provide 3-5 specific, actionable suggestions to improve the resume. Be concise and practical.'
                },
                {
                    role: 'user',
                    content: suggestionsPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 400
        });

        const suggestions = suggestionsCompletion.choices[0].message.content.split('\n').filter(s => s.trim());

        return {
            explanation,
            suggestions,
            generatedBy: 'openai-gpt4'
        };
    } catch (error) {
        console.error('Error generating AI explanation:', error.message);
        return generateFallbackExplanation(scoreResult);
    }
}

/**
 * Build prompt for score explanation
 */
function buildPrompt(scoreResult) {
    const { overallScore, categoryScores, breakdown, metadata } = scoreResult;

    return `A resume has been evaluated with the following DETERMINISTIC scores:

Overall ATS Score: ${overallScore}/100

Category Breakdown:
- Keyword Relevance: ${Math.round(categoryScores.keywordRelevance)}/100
- Role Alignment: ${Math.round(categoryScores.roleAlignment)}/100  
- Resume Structure: ${Math.round(categoryScores.structure)}/100
- ATS Formatting: ${Math.round(categoryScores.formatting)}/100

Details:
- Target Role: ${metadata.targetRole}
- Core Skills Found: ${breakdown.roleAlignment.details.coreSkills?.length || 0}
- Transferable Skills Found: ${breakdown.roleAlignment.details.transferableSkills?.length || 0}
- Missing Core Skills: ${breakdown.roleAlignment.details.missingCoreSkills?.slice(0, 3).join(', ') || 'None'}
- Formatting Issues: ${breakdown.formatting.details.issues.length > 0 ? breakdown.formatting.details.issues.join(', ') : 'None'}

Explain why they received this score in 2-3 paragraphs. Be specific about what helped and what could be improved. Be encouraging.`;
}

/**
 * Build prompt for improvement suggestions
 */
function buildSuggestionsPrompt(scoreResult) {
    const { breakdown, metadata } = scoreResult;

    const missingSkills = breakdown.roleAlignment.details.missingCoreSkills?.slice(0, 5) || [];
    const formattingIssues = breakdown.formatting.details.issues || [];

    return `Based on this resume analysis, provide 3-5 specific improvement suggestions:

Missing Core Skills: ${missingSkills.join(', ') || 'None'}
Formatting Issues: ${formattingIssues.join(', ') || 'None'}
Target Role: ${metadata.targetRole}

Provide actionable suggestions like:
- Add specific skills
- Improve bullet point phrasing
- Fix formatting issues
- Enhance certain sections

Be specific and practical.`;
}

/**
 * Generate fallback explanation when OpenAI is not available
 */
function generateFallbackExplanation(scoreResult) {
    const { overallScore, categoryScores, breakdown } = scoreResult;

    let explanation = `Your resume received an overall ATS score of ${overallScore}/100. `;

    // Analyze each category
    if (categoryScores.keywordRelevance < 60) {
        explanation += `Your keyword relevance score (${Math.round(categoryScores.keywordRelevance)}/100) suggests your resume may not contain enough relevant keywords from the job description. `;
    } else {
        explanation += `Your keyword relevance score (${Math.round(categoryScores.keywordRelevance)}/100) shows good alignment with the target role. `;
    }

    if (categoryScores.roleAlignment < 60) {
        explanation += `Your role alignment score (${Math.round(categoryScores.roleAlignment)}/100) indicates missing core skills for the target role. `;
    }

    if (categoryScores.formatting < 80) {
        explanation += `Your resume has some ATS formatting issues that could affect parsing. `;
    }

    // Generate suggestions
    const suggestions = [];

    if (breakdown.roleAlignment.details.missingCoreSkills?.length > 0) {
        suggestions.push(`Add missing core skills: ${breakdown.roleAlignment.details.missingCoreSkills.slice(0, 3).join(', ')}`);
    }

    if (breakdown.formatting.details.issues.length > 0) {
        suggestions.push(`Fix formatting issues: ${breakdown.formatting.details.issues[0]}`);
    }

    if (breakdown.keywordRelevance.details.missingKeywords?.length > 0) {
        suggestions.push('Include more relevant keywords from the job description');
    }

    suggestions.push('Use action verbs and quantify achievements with metrics');
    suggestions.push('Ensure resume sections are clearly labeled');

    return {
        explanation,
        suggestions: suggestions.slice(0, 5),
        generatedBy: 'fallback'
    };
}
