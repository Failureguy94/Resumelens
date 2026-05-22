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
                        {details?.reasoning && (
                            <div className="detail-section">
                                <p className="reasoning-text">{details.reasoning}</p>
                            </div>
                        )}
                        
                        {details?.strengths?.length > 0 && (
                            <div className="detail-section">
                                <h4>✅ Strengths</h4>
                                <ul className="strengths-list">
                                    {details.strengths.map((strength, i) => (
                                        <li key={i}>{strength}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {details?.weaknesses?.length > 0 && (
                            <div className="detail-section">
                                <h4>⚠️ Areas for Improvement</h4>
                                <ul className="weaknesses-list">
                                    {details.weaknesses.map((weakness, i) => (
                                        <li key={i}>{weakness}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
            )}
        </div>
    );
}
