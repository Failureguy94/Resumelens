import natural from 'natural';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

/**
 * Extract keywords using TF-IDF and calculate relevance
 * @param {string} resumeText - Resume text
 * @param {string} targetText - Job description or role keywords
 * @returns {Object} - Keyword analysis and score
 */
export function analyzeKeywords(resumeText, targetText) {
    const tfidf = new TfIdf();

    // Add documents
    tfidf.addDocument(resumeText.toLowerCase());
    tfidf.addDocument(targetText.toLowerCase());

    // Extract top keywords from resume
    const resumeKeywords = extractTopKeywords(tfidf, 0, 30);

    // Extract top keywords from target
    const targetKeywords = extractTopKeywords(tfidf, 1, 30);

    // Calculate keyword overlap
    const matchedKeywords = resumeKeywords.filter(kw =>
        targetKeywords.some(tk => tk.term === kw.term)
    );

    const missingKeywords = targetKeywords.filter(tk =>
        !resumeKeywords.some(kw => kw.term === tk.term)
    ).slice(0, 10); // Top 10 missing

    // Calculate cosine similarity
    const similarity = calculateCosineSimilarity(resumeText, targetText);

    // Score based on keyword overlap and similarity
    const overlapScore = (matchedKeywords.length / targetKeywords.length) * 100;
    const similarityScore = similarity * 100;
    const finalScore = (overlapScore * 0.6) + (similarityScore * 0.4);

    return {
        score: Math.min(finalScore, 100),
        resumeKeywords: resumeKeywords.slice(0, 15),
        targetKeywords: targetKeywords.slice(0, 15),
        matchedKeywords: matchedKeywords.slice(0, 15),
        missingKeywords,
        similarity
    };
}

/**
 * Extract top keywords from TF-IDF
 */
function extractTopKeywords(tfidf, docIndex, limit) {
    const keywords = [];

    tfidf.listTerms(docIndex).forEach(item => {
        // Filter out very short words and common stop words
        if (item.term.length > 2 && !isStopWord(item.term)) {
            keywords.push({
                term: item.term,
                score: item.tfidf
            });
        }
    });

    return keywords.slice(0, limit);
}

/**
 * Calculate cosine similarity between two texts
 */
function calculateCosineSimilarity(text1, text2) {
    const tokens1 = tokenizer.tokenize(text1.toLowerCase()) || [];
    const tokens2 = tokenizer.tokenize(text2.toLowerCase()) || [];

    // Create frequency vectors
    const allTokens = new Set([...tokens1, ...tokens2]);
    const vector1 = {};
    const vector2 = {};

    allTokens.forEach(token => {
        vector1[token] = tokens1.filter(t => t === token).length;
        vector2[token] = tokens2.filter(t => t === token).length;
    });

    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    allTokens.forEach(token => {
        dotProduct += vector1[token] * vector2[token];
        magnitude1 += vector1[token] ** 2;
        magnitude2 += vector2[token] ** 2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Check if word is a common stop word
 */
function isStopWord(word) {
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);

    return stopWords.has(word);
}

/**
 * Extract skills and technologies using pattern matching
 */
export function extractSkills(text) {
    const skills = new Set();

    // Common tech skills patterns
    const techPatterns = [
        // Programming languages
        /\b(python|java|javascript|typescript|c\+\+|c#|ruby|php|swift|kotlin|go|rust)\b/gi,
        // Web technologies
        /\b(react|angular|vue|node\.js|express|django|flask|spring|\.net|asp\.net)\b/gi,
        // Databases
        /\b(mysql|postgresql|mongodb|redis|elasticsearch|sql|nosql|oracle|sql\s*server)\b/gi,
        // Cloud/DevOps
        /\b(aws|azure|gcp|docker|kubernetes|jenkins|git|ci\/cd|terraform|ansible)\b/gi,
        // Data Science/ML
        /\b(tensorflow|pytorch|scikit-learn|pandas|numpy|machine\s*learning|deep\s*learning|nlp)\b/gi,
        // Tools
        /\b(jira|confluence|slack|figma|photoshop|illustrator|excel|powerpoint)\b/gi
    ];

    techPatterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        matches.forEach(match => skills.add(match.toLowerCase()));
    });

    return Array.from(skills);
}
