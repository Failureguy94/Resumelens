/**
 * Detect resume sections using regex patterns and rules
 * @param {string} text - Resume text
 * @returns {Object} - Detected sections with their content
 */
export function detectSections(text) {
    const sections = {
        contact: '',
        summary: '',
        education: '',
        experience: '',
        skills: '',
        projects: '',
        achievements: '',
        certifications: '',
        other: ''
    };

    // Section headers patterns (case-insensitive)
    const patterns = {
        contact: /^(contact|personal\s+information|details)/im,
        summary: /^(summary|objective|profile|about\s+me)/im,
        education: /^(education|academic|qualifications)/im,
        experience: /^(experience|work\s+history|employment|professional\s+experience)/im,
        skills: /^(skills|technical\s+skills|competencies|expertise)/im,
        projects: /^(projects|portfolio|work\s+samples)/im,
        achievements: /^(achievements|awards|honors|accomplishments)/im,
        certifications: /^(certifications|certificates|licenses)/im
    };

    // Split text into lines
    const lines = text.split('\n');
    let currentSection = 'other';
    let sectionContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if this line is a section header
        let foundSection = false;
        for (const [section, pattern] of Object.entries(patterns)) {
            if (pattern.test(line)) {
                // Save previous section content
                if (sectionContent.length > 0) {
                    sections[currentSection] += sectionContent.join('\n') + '\n';
                }

                // Start new section
                currentSection = section;
                sectionContent = [];
                foundSection = true;
                break;
            }
        }

        if (!foundSection && line.length > 0) {
            sectionContent.push(line);
        }
    }

    // Save last section
    if (sectionContent.length > 0) {
        sections[currentSection] += sectionContent.join('\n');
    }

    // Extract contact info (email, phone) from entire text if contact section is empty
    if (!sections.contact || sections.contact.trim().length === 0) {
        sections.contact = extractContactInfo(text);
    }

    return sections;
}

/**
 * Extract contact information from text
 */
function extractContactInfo(text) {
    let contact = '';

    // Email pattern
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
        contact += `Email: ${emailMatch[0]}\n`;
    }

    // Phone pattern
    const phoneMatch = text.match(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
    if (phoneMatch) {
        contact += `Phone: ${phoneMatch[0]}\n`;
    }

    // LinkedIn pattern
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
        contact += `LinkedIn: ${linkedinMatch[0]}\n`;
    }

    return contact;
}

/**
 * Calculate section completeness score
 */
export function calculateSectionScore(sections) {
    const requiredSections = ['education', 'experience', 'skills'];
    const optionalSections = ['summary', 'projects', 'achievements', 'certifications'];

    let score = 0;
    let details = {
        present: [],
        missing: [],
        optional: []
    };

    // Check required sections (60 points total)
    requiredSections.forEach(section => {
        if (sections[section] && sections[section].trim().length > 50) {
            score += 20;
            details.present.push(section);
        } else {
            details.missing.push(section);
        }
    });

    // Check optional sections (40 points total)
    optionalSections.forEach(section => {
        if (sections[section] && sections[section].trim().length > 30) {
            score += 10;
            details.optional.push(section);
        }
    });

    return {
        score: Math.min(score, 100),
        details
    };
}
