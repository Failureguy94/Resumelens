import { useState } from 'react';
import './ScoreCard.css';

export default function ScoreCard({ category, expanded, onToggle }) {
    const { name, icon, score, details } = category;

    const getScoreColor = (score) => {
        if (score >= 80) return '#4ade80';
        if (score >= 60) return '#60a5fa';
        if (score >= 40) return '#fbbf24';
        return '#f87171';
    };

    return (
        <div className="score-card">
            <div className="score-card-header" onClick={onToggle}>
                <div className="card-title">
                    <span className="card-icon">{icon}</span>
                    <h3>{name}</h3>
                </div>
                <div className="card-score" style={{ color: getScoreColor(score) }}>
                    {Math.round(score)}
                </div>
            </div>

            <div className="score-progress">
                <div
                    className="score-progress-fill"
                    style={{
                        width: `${score}%`,
                        background: getScoreColor(score)
                    }}
                />
            </div>

            <button className="expand-btn" onClick={onToggle}>
                {expanded ? 'Hide Details' : 'View Details'}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {expanded && (
                <div className="score-card-details">
                    {category.key === 'keywordRelevance' && (
                        <>
                            {details.matchedKeywords?.length > 0 && (
                                <div className="detail-section">
                                    <h4>Matched Keywords</h4>
                                    <div className="keyword-list">
                                        {details.matchedKeywords.slice(0, 10).map((kw, i) => (
                                            <span key={i} className="keyword-tag matched">{kw.term}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {details.missingKeywords?.length > 0 && (
                                <div className="detail-section">
                                    <h4>Missing Keywords</h4>
                                    <div className="keyword-list">
                                        {details.missingKeywords.slice(0, 8).map((kw, i) => (
                                            <span key={i} className="keyword-tag missing">{kw.term}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {category.key === 'roleAlignment' && (
                        <>
                            <div className="detail-section">
                                <div className="stat-row">
                                    <span>Core Skills Match</span>
                                    <strong>{details.coreSkillPercentage || 0}%</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Core Skills Found</span>
                                    <strong>{details.coreSkills?.length || 0}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Transferable Skills</span>
                                    <strong>{details.transferableSkills?.length || 0}</strong>
                                </div>
                            </div>
                        </>
                    )}

                    {category.key === 'structure' && (
                        <div className="detail-section">
                            {details.present?.length > 0 && (
                                <div className="stat-row">
                                    <span>Present Sections</span>
                                    <strong>{details.present.join(', ')}</strong>
                                </div>
                            )}
                            {details.missing?.length > 0 && (
                                <div className="stat-row warning">
                                    <span>Missing Sections</span>
                                    <strong>{details.missing.join(', ')}</strong>
                                </div>
                            )}
                        </div>
                    )}

                    {category.key === 'formatting' && (
                        <div className="detail-section">
                            {details.passed && (
                                <p className="success-message">✅ No formatting issues detected!</p>
                            )}
                            {details.issues?.length > 0 && (
                                <ul className="issues-list">
                                    {details.issues.map((issue, i) => (
                                        <li key={i}>⚠️ {issue}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
