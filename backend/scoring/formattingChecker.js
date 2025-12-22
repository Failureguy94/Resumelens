/**
 * Check resume formatting for ATS compatibility
 * @param {string} text - Resume text
 * @returns {Object} - Formatting score and issues
 */
export function checkFormatting(text) {
    const issues = [];
    let score = 100;

    // Check for table indicators (common ATS problem)
    if (hasTableStructure(text)) {
        issues.push('Tables detected - may cause parsing issues');
        score -= 15;
    }

    // Check for multi-column layout indicators
    if (hasMultiColumnLayout(text)) {
        issues.push('Multi-column layout detected - may cause reading order issues');
        score -= 15;
    }

    // Check for excessive special characters
    if (hasExcessiveSpecialChars(text)) {
        issues.push('Excessive special characters detected');
        score -= 10;
    }

    // Check for proper bullet points
    if (!hasStandardBullets(text)) {
        issues.push('Non-standard bullet formatting detected');
        score -= 5;
    }

    // Check text length (too short may indicate parsing issues)
    if (text.length < 500) {
        issues.push('Resume appears very short - may indicate parsing issues');
        score -= 20;
    }

    // Check for proper capitalization patterns
    if (hasAllCapsWords(text)) {
        issues.push('Excessive all-caps text detected - prefer standard capitalization');
        score -= 5;
    }

    return {
        score: Math.max(score, 0),
        issues,
        passed: issues.length === 0
    };
}

/**
 * Detect table structure indicators
 */
function hasTableStructure(text) {
    // Look for pipe characters or excessive tabs
    const pipeCount = (text.match(/\|/g) || []).length;
    const tabCount = (text.match(/\t/g) || []).length;

    return pipeCount > 10 || tabCount > 15;
}

/**
 * Detect multi-column layout
 */
function hasMultiColumnLayout(text) {
    const lines = text.split('\n');
    let suspiciousLines = 0;

    // Check for lines with multiple spaces indicating columns
    for (const line of lines) {
        if (line.match(/\s{5,}\S+\s{5,}/)) {
            suspiciousLines++;
        }
    }

    return suspiciousLines > 3;
}

/**
 * Check for excessive special characters
 */
function hasExcessiveSpecialChars(text) {
    const specialChars = text.match(/[★☆◆◇■□●○▪▫►▻♦♢]/g) || [];
    return specialChars.length > 10;
}

/**
 * Check for standard bullet formatting
 */
function hasStandardBullets(text) {
    // Standard bullets: -, •, *, •
    const standardBullets = text.match(/^[\s]*[-•*○]\s+/gm) || [];
    return standardBullets.length > 0;
}

/**
 * Check for excessive all-caps usage
 */
function hasAllCapsWords(text) {
    const words = text.match(/\b[A-Z]{4,}\b/g) || [];
    // Allow some all-caps (acronyms like HTML, CSS, etc.)
    return words.length > 20;
}
