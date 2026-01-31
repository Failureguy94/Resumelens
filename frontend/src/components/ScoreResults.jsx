import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreCard from './ScoreCard';
import './ScoreResults.css';

export default function ScoreResults({ analysisResult }) {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(null);

    if (!analysisResult) {
        navigate('/');
        return null;
    }

    const { scoreResult, explanation, suggestions } = analysisResult;
    const { overallScore, categories, keyStrengths, redFlags, detectedAbsurdities } = scoreResult;

    // Monochrome score colors
    const getScoreColor = (score) => {
        if (score >= 80) return '#ffffff'; // Excellent - White
        if (score >= 60) return '#cccccc'; // Good - Light Gray
        if (score >= 40) return '#999999'; // Fair - Medium Gray
        return '#666666'; // Poor - Dark Gray
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Needs Improvement';
        return 'Poor';
    };

    // Get icon based on category name (dynamic)
    const getCategoryIcon = (name) => {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('keyword') || nameLower.includes('relevance')) return '🔍';
        if (nameLower.includes('experience') || nameLower.includes('work')) return '�';
        if (nameLower.includes('skill') || nameLower.includes('technical')) return '⚡';
        if (nameLower.includes('education') || nameLower.includes('academic')) return '🎓';
        if (nameLower.includes('format') || nameLower.includes('structure')) return '📋';
        if (nameLower.includes('achievement') || nameLower.includes('impact')) return '🏆';
        if (nameLower.includes('quality') || nameLower.includes('professional')) return '✨';
        return '📊'; // Default
    };

    // Use dynamic categories from AI
    const dynamicCategories = categories?.map((cat, index) => ({
        key: `category-${index}`,
        name: cat.name,
        icon: getCategoryIcon(cat.name),
        score: cat.score,
        weight: cat.weight,
        details: {
            reasoning: cat.reasoning,
            strengths: cat.strengths,
            weaknesses: cat.weaknesses
        }
    })) || [];

    return (
        <div className="score-results">
            <div className="container">
                {/* Header */}
                <header className="results-header fade-in">
                    <h1 className="gradient-text">Your ATS Score</h1>
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Try Another Resume
                    </button>
                </header>

                {/* Overall Score */}
                <div className="overall-score-section fade-in">
                    <div className="score-circle-container">
                        <div className="score-circle" style={{
                            background: `conic-gradient(${getScoreColor(overallScore)} ${overallScore * 3.6}deg, var(--bg-input) 0deg)`
                        }}>
                            <div className="score-inner">
                                <div className="score-value">{overallScore}</div>
                                <div className="score-max">/100</div>
                            </div>
                        </div>
                    </div>
                    <div className="score-summary">
                        <h2 className="score-label" style={{ color: getScoreColor(overallScore) }}>
                            {getScoreLabel(overallScore)}
                        </h2>
                        <p className="score-description">{explanation}</p>
                    </div>
                </div>

                {/* Category Breakdown - Dynamic AI Categories */}
                <section className="category-section fade-in">
                    <h2 className="section-heading">AI Analysis Breakdown</h2>
                    <div className="category-grid">
                        {dynamicCategories.map((category) => (
                            <ScoreCard
                                key={category.key}
                                category={category}
                                expanded={expandedSection === category.key}
                                onToggle={() => setExpandedSection(
                                    expandedSection === category.key ? null : category.key
                                )}
                            />
                        ))}
                    </div>
                </section>

                {/* Red Flags / Absurdities */}
                {(redFlags?.length > 0 || detectedAbsurdities?.length > 0) && (
                    <section className="warnings-section fade-in">
                        <h2 className="section-heading">⚠️ Areas of Concern</h2>
                        <div className="warnings-list">
                            {redFlags?.map((flag, index) => (
                                <div key={index} className="warning-item">
                                    <span className="warning-icon">⚠️</span>
                                    <p>{flag}</p>
                                </div>
                            ))}
                            {detectedAbsurdities?.map((absurdity, index) => (
                                <div key={`abs-${index}`} className="warning-item absurdity">
                                    <span className="warning-icon">🚨</span>
                                    <p><strong>Detected Issue:</strong> {absurdity}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* AI Suggestions */}
                {suggestions && suggestions.length > 0 && (
                    <section className="suggestions-section fade-in">
                        <h2 className="section-heading">💡 AI-Powered Suggestions</h2>
                        <div className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="suggestion-item slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="suggestion-number">{index + 1}</div>
                                    <p>{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Beta Section */}
                <section className="beta-section glass fade-in">
                    <div className="beta-header">
                        <span className="beta-badge">🧪 Beta</span>
                        <h3>Resume Editing & Export</h3>
                    </div>
                    <p>Coming Soon! Auto-edit your resume and export to LaTeX, PDF, or DOCX.</p>
                    <button className="btn btn-secondary" disabled>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        Notify Me When Available
                    </button>
                </section>


            </div>
        </div>
    );
}
