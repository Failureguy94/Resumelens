/**
 * Role-aware weighting system for skill evaluation
 * Implements soft weighting: core (high), transferable (medium), peripheral (low)
 */

// Define role-specific skill categories with weights
export const roleWeights = {
    'software-engineer': {
        name: 'Software Engineer',
        core: {
            weight: 0.7,
            skills: [
                'programming', 'algorithms', 'data structures', 'coding', 'software development',
                'git', 'version control', 'debugging', 'testing', 'code review',
                'java', 'python', 'javascript', 'c++', 'typescript'
            ]
        },
        transferable: {
            weight: 0.4,
            skills: [
                'problem solving', 'teamwork', 'agile', 'scrum', 'project management',
                'communication', 'leadership', 'competitive programming', 'hackathons',
                'open source', 'system design', 'architecture'
            ]
        },
        peripheral: {
            weight: 0.15,
            skills: [
                'design', 'ui/ux', 'marketing', 'sales', 'business development',
                'content creation', 'social media'
            ]
        }
    },

    'data-scientist': {
        name: 'Data Scientist',
        core: {
            weight: 0.75,
            skills: [
                'machine learning', 'deep learning', 'python', 'r', 'statistics',
                'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch',
                'scikit-learn', 'sql', 'data mining', 'modeling', 'algorithms'
            ]
        },
        transferable: {
            weight: 0.45,
            skills: [
                'research', 'mathematics', 'programming', 'problem solving',
                'visualization', 'communication', 'domain expertise', 'experimentation',
                'a/b testing', 'excel', 'tableau', 'power bi'
            ]
        },
        peripheral: {
            weight: 0.2,
            skills: [
                'web development', 'mobile development', 'design', 'marketing',
                'sales', 'business development'
            ]
        }
    },

    'product-manager': {
        name: 'Product Manager',
        core: {
            weight: 0.7,
            skills: [
                'product management', 'roadmap', 'strategy', 'stakeholder management',
                'requirements gathering', 'user stories', 'prioritization', 'metrics',
                'kpis', 'product analytics', 'market research', 'competitive analysis'
            ]
        },
        transferable: {
            weight: 0.5,
            skills: [
                'communication', 'leadership', 'agile', 'scrum', 'jira', 'confluence',
                'project management', 'data analysis', 'sql', 'excel', 'presentation',
                'technical knowledge', 'user experience', 'design thinking'
            ]
        },
        peripheral: {
            weight: 0.2,
            skills: [
                'programming', 'coding', 'development', 'design', 'photoshop',
                'illustrator'
            ]
        }
    },

    'frontend-developer': {
        name: 'Frontend Developer',
        core: {
            weight: 0.75,
            skills: [
                'html', 'css', 'javascript', 'react', 'angular', 'vue', 'typescript',
                'responsive design', 'web development', 'ui development', 'dom', 'ajax',
                'rest api', 'webpack', 'npm', 'git'
            ]
        },
        transferable: {
            weight: 0.4,
            skills: [
                'ui/ux', 'design', 'figma', 'photoshop', 'accessibility', 'performance',
                'testing', 'debugging', 'problem solving', 'agile', 'teamwork',
                'backend development', 'node.js'
            ]
        },
        peripheral: {
            weight: 0.15,
            skills: [
                'data science', 'machine learning', 'devops', 'cloud', 'marketing',
                'sales'
            ]
        }
    },

    'backend-developer': {
        name: 'Backend Developer',
        core: {
            weight: 0.75,
            skills: [
                'server', 'api', 'rest', 'graphql', 'database', 'sql', 'nosql',
                'node.js', 'python', 'java', 'go', 'spring', 'django', 'flask',
                'express', 'microservices', 'authentication', 'security'
            ]
        },
        transferable: {
            weight: 0.4,
            skills: [
                'algorithms', 'data structures', 'system design', 'architecture',
                'devops', 'docker', 'kubernetes', 'cloud', 'aws', 'azure', 'gcp',
                'testing', 'git', 'agile', 'problem solving'
            ]
        },
        peripheral: {
            weight: 0.15,
            skills: [
                'frontend', 'react', 'angular', 'design', 'ui/ux', 'mobile',
                'marketing'
            ]
        }
    },

    'designer': {
        name: 'UI/UX Designer',
        core: {
            weight: 0.7,
            skills: [
                'ui design', 'ux design', 'user experience', 'user interface',
                'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
                'prototyping', 'wireframing', 'user research', 'usability testing'
            ]
        },
        transferable: {
            weight: 0.45,
            skills: [
                'design thinking', 'creativity', 'communication', 'collaboration',
                'html', 'css', 'frontend', 'accessibility', 'branding', 'typography',
                'color theory', 'visual design', 'interaction design'
            ]
        },
        peripheral: {
            weight: 0.2,
            skills: [
                'programming', 'backend', 'data science', 'marketing', 'seo',
                'content writing'
            ]
        }
    },

    'devops-engineer': {
        name: 'DevOps Engineer',
        core: {
            weight: 0.75,
            skills: [
                'devops', 'ci/cd', 'jenkins', 'docker', 'kubernetes', 'terraform',
                'ansible', 'aws', 'azure', 'gcp', 'cloud', 'infrastructure',
                'automation', 'monitoring', 'deployment', 'linux', 'bash', 'scripting'
            ]
        },
        transferable: {
            weight: 0.4,
            skills: [
                'problem solving', 'system administration', 'networking', 'security',
                'python', 'git', 'agile', 'collaboration', 'troubleshooting',
                'performance optimization', 'backend development'
            ]
        },
        peripheral: {
            weight: 0.15,
            skills: [
                'frontend', 'design', 'data science', 'machine learning', 'marketing',
                'sales'
            ]
        }
    },

    'general': {
        name: 'General ATS',
        core: {
            weight: 0.6,
            skills: [] // Will use all detected skills equally
        },
        transferable: {
            weight: 0.5,
            skills: [
                'communication', 'teamwork', 'leadership', 'problem solving',
                'project management', 'time management', 'critical thinking',
                'analytical skills', 'creativity', 'adaptability'
            ]
        },
        peripheral: {
            weight: 0.3,
            skills: []
        }
    }
};

/**
 * Get role weights for a target role
 */
export function getRoleWeights(roleKey) {
    return roleWeights[roleKey] || roleWeights['general'];
}

/**
 * Categorize a skill based on role
 */
export function categorizeSkill(skill, roleKey) {
    const role = getRoleWeights(roleKey);

    const skillLower = skill.toLowerCase();

    // Check core skills
    if (role.core.skills.some(s => skillLower.includes(s) || s.includes(skillLower))) {
        return { category: 'core', weight: role.core.weight };
    }

    // Check transferable skills
    if (role.transferable.skills.some(s => skillLower.includes(s) || s.includes(skillLower))) {
        return { category: 'transferable', weight: role.transferable.weight };
    }

    // Default to peripheral
    return { category: 'peripheral', weight: role.peripheral.weight };
}

/**
 * Get all available roles
 */
export function getAvailableRoles() {
    return Object.entries(roleWeights)
        .filter(([key]) => key !== 'general')
        .map(([key, value]) => ({
            key,
            name: value.name
        }));
}
