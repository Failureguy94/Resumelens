import { analyzeKeywords, extractSkills } from './keywordExtractor.js';
import { detectSections, calculateSectionScore } from './sectionDetector.js';
import { checkFormatting } from './formattingChecker.js';
import { getRoleWeights, categorizeSkill } from './roleWeights.js';

/**
 * Main deterministic ATS scoring calculator
 * Combines all scoring components with role-aware weighting
 * 
 * @param {string} resumeText - Parsed resume text
 * @param {Object} evaluationParams - Evaluation parameters
 * @returns {Object} - Complete score breakdown
 */
export function calculateATSScore(resumeText, evaluationParams) {
    const { mode, jobDescription, targetRole } = evaluationParams;

    // 1. Detect sections
    const sections = detectSections(resumeText);
    const sectionScore = calculateSectionScore(sections);

    // 2. Check formatting
    const formattingResult = checkFormatting(resumeText);

    // 3. Extract skills from resume
    const resumeSkills = extractSkills(resumeText);

    // 4. Calculate keyword relevance based on mode
    let keywordResult;
    let roleAlignment;

    if (mode === 'job-description' && jobDescription) {
        // Mode 1: Job description provided
        keywordResult = analyzeKeywords(resumeText, jobDescription);
        roleAlignment = calculateRoleAlignment(resumeSkills, resumeText, 'general', jobDescription);
    } else if (mode === 'target-role' && targetRole) {
        // Mode 2: Target role specified
        const roleWeights = getRoleWeights(targetRole);
        const roleKeywords = generateRoleKeywords(roleWeights);
        keywordResult = analyzeKeywords(resumeText, roleKeywords);
        roleAlignment = calculateRoleAlignment(resumeSkills, resumeText, targetRole);
    } else {
        // Mode 3: General ATS score
        const generalKeywords = 'professional experience education skills qualifications achievements projects leadership teamwork communication';
        keywordResult = analyzeKeywords(resumeText, generalKeywords);
        roleAlignment = calculateRoleAlignment(resumeSkills, resumeText, 'general');
    }

    // 5. Calculate final weighted score
    const weights = {
        keywordRelevance: 0.35,
        roleAlignment: 0.30,
        structure: 0.20,
        formatting: 0.15
    };

    const categoryScores = {
        keywordRelevance: keywordResult.score,
        roleAlignment: roleAlignment.score,
        structure: sectionScore.score,
        formatting: formattingResult.score
    };

    const finalScore =
        categoryScores.keywordRelevance * weights.keywordRelevance +
        categoryScores.roleAlignment * weights.roleAlignment +
        categoryScores.structure * weights.structure +
        categoryScores.formatting * weights.formatting;

    // 6. Build detailed breakdown
    return {
        overallScore: Math.round(finalScore),
        categoryScores,
        categoryWeights: weights,
        breakdown: {
            keywordRelevance: {
                score: categoryScores.keywordRelevance,
                weight: weights.keywordRelevance,
                details: {
                    matchedKeywords: keywordResult.matchedKeywords,
                    missingKeywords: keywordResult.missingKeywords,
                    similarity: keywordResult.similarity
                }
            },
            roleAlignment: {
                score: categoryScores.roleAlignment,
                weight: weights.roleAlignment,
                details: roleAlignment.details
            },
            structure: {
                score: categoryScores.structure,
                weight: weights.structure,
                details: sectionScore.details
            },
            formatting: {
                score: categoryScores.formatting,
                weight: weights.formatting,
                details: {
                    issues: formattingResult.issues,
                    passed: formattingResult.passed
                }
            }
        },
        metadata: {
            mode,
            targetRole: targetRole || 'general',
            sections,
            resumeSkills
        }
    };
}

/**
 * Calculate role alignment score using soft weighting
 */
function calculateRoleAlignment(resumeSkills, resumeText, roleKey, jobDescription = '') {
    const roleWeights = getRoleWeights(roleKey);

    let coreSkillsFound = [];
    let transferableSkillsFound = [];
    let peripheralSkillsFound = [];
    let missingCoreSkills = [];

    // Combine resume text and skills for comprehensive analysis
    const fullText = (resumeText + ' ' + resumeSkills.join(' ')).toLowerCase();

    // Check for core skills
    roleWeights.core.skills.forEach(skill => {
        if (fullText.includes(skill.toLowerCase())) {
            coreSkillsFound.push({ skill, weight: roleWeights.core.weight });
        } else {
            missingCoreSkills.push(skill);
        }
    });

    // Check for transferable skills
    roleWeights.transferable.skills.forEach(skill => {
        if (fullText.includes(skill.toLowerCase())) {
            transferableSkillsFound.push({ skill, weight: roleWeights.transferable.weight });
        }
    });

    // Check for peripheral skills
    roleWeights.peripheral.skills.forEach(skill => {
        if (fullText.includes(skill.toLowerCase())) {
            peripheralSkillsFound.push({ skill, weight: roleWeights.peripheral.weight });
        }
    });

    // Calculate weighted score
    const maxCoreScore = roleWeights.core.skills.length * roleWeights.core.weight;
    const maxTransferableScore = roleWeights.transferable.skills.length * roleWeights.transferable.weight;

    const coreScore = coreSkillsFound.length > 0
        ? (coreSkillsFound.length / roleWeights.core.skills.length) * 100
        : 0;

    const transferableScore = transferableSkillsFound.length > 0
        ? (transferableSkillsFound.length / roleWeights.transferable.skills.length) * 60
        : 0;

    const peripheralScore = peripheralSkillsFound.length * 2; // Small bonus

    // Core skills are most important, transferable add value but don't outweigh missing core
    const alignmentScore = Math.min(
        coreScore * 0.7 + transferableScore * 0.25 + peripheralScore * 0.05,
        100
    );

    return {
        score: Math.round(alignmentScore),
        details: {
            coreSkills: coreSkillsFound,
            transferableSkills: transferableSkillsFound,
            peripheralSkills: peripheralSkillsFound,
            missingCoreSkills: missingCoreSkills.slice(0, 10),
            coreSkillPercentage: Math.round((coreSkillsFound.length / roleWeights.core.skills.length) * 100)
        }
    };
}

/**
 * Generate keyword string from role weights
 */
function generateRoleKeywords(roleWeights) {
    const allSkills = [
        ...roleWeights.core.skills,
        ...roleWeights.transferable.skills
    ];
    return allSkills.join(' ');
}
