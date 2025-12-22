import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'recharts';
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
    const { overallScore, categoryScores, breakdown } = scoreResult;

    const getScoreColor = (score) => {
        if (score >= 80) return '#4ade80'; // Excellent - Green
        if (score >= 60) return '#60a5fa'; // Good - Blue
        if (score >= 40) return '#fbbf24'; // Fair - Yellow
        return '#f87171'; // Poor - Red
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Needs Improvement';
        return 'Poor';
    };

    const categories = [
        {
            key: 'keywordRelevance',
            name: 'Keyword Relevance',
            icon: '🔍',
            score: categoryScores.keywordRelevance,
            details: breakdown.keywordRelevance.details
        },
        {
            key: 'roleAlignment',
            name: 'Role Alignment',
            icon: '🎯',
            score: categoryScores.roleAlignment,
            details: breakdown.roleAlignment.details
        },
        {
            key: 'structure',
            name: 'Resume Structure',
            icon: '📋',
            score: categoryScores.structure,
            details: breakdown.structure.details
        },
        {
            key: 'formatting',
            name: 'ATS Formatting',
            icon: '✨',
            score: categoryScores.formatting,
            details: breakdown.formatting.details
        }
    ];

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

                {/* Category Breakdown */}
                <section className="category-section fade-in">
                    <h2 className="section-heading">Category Breakdown</h2>
                    <div className="category-grid">
                        {categories.map((category) => (
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

                {/* Detailed Breakdown Sections */}
                <section className="detailed-breakdown fade-in">
                    <h2 className="section-heading">Detailed Analysis</h2>

                    {/* Skills that Helped */}
                    {breakdown.roleAlignment.details.coreSkills?.length > 0 && (
                        <div className="detail-card">
                            <h3>✅ Skills That Helped</h3>
                            <div className="skill-tags">
                                {breakdown.roleAlignment.details.coreSkills.slice(0, 10).map((item, index) => (
                                    <span key={index} className="skill-tag core">
                                        {item.skill}
                                        <span className="skill-weight">Core • {Math.round(item.weight * 100)}%</span>
                                    </span>
                                ))}
                            </div>
                            {breakdown.roleAlignment.details.transferableSkills?.length > 0 && (
                                <>
                                    <h4 className="subsection-title">Transferable Skills</h4>
                                    <div className="skill-tags">
                                        {breakdown.roleAlignment.details.transferableSkills.slice(0, 8).map((item, index) => (
                                            <span key={index} className="skill-tag transferable">
                                                {item.skill}
                                                <span className="skill-weight">Transferable • {Math.round(item.weight * 100)}%</span>
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Missing Skills */}
                    {breakdown.roleAlignment.details.missingCoreSkills?.length > 0 && (
                        <div className="detail-card">
                            <h3>❌ Missing Core Skills</h3>
                            <div className="skill-tags">
                                {breakdown.roleAlignment.details.missingCoreSkills.map((skill, index) => (
                                    <span key={index} className="skill-tag missing">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p className="detail-hint">
                                Adding these skills could significantly improve your score
                            </p>
                        </div>
                    )}

                    {/* Formatting Issues */}
                    {breakdown.formatting.details.issues?.length > 0 && (
                        <div className="detail-card">
                            <h3>⚠️ Formatting Issues</h3>
                            <ul className="issue-list">
                                {breakdown.formatting.details.issues.map((issue, index) => (
                                    <li key={index}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
