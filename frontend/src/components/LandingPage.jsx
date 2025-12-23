import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import FileUpload from './FileUpload';
import './LandingPage.css';

export default function LandingPage({ setAnalysisResult }) {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [evaluationMode, setEvaluationMode] = useState('job-description');
    const [jobDescription, setJobDescription] = useState('');
    const [jobLink, setJobLink] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch available roles
        axios.get('/api/roles')
            .then(res => setRoles(res.data.roles))
            .catch(err => console.error('Failed to fetch roles:', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedFile) {
            setError('Please upload your resume');
            return;
        }

        if (evaluationMode === 'job-description' && !jobDescription && !jobLink) {
            setError('Please provide a job description or job link');
            return;
        }

        if (evaluationMode === 'target-role' && !targetRole) {
            setError('Please select a target role');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('resume', selectedFile);
            formData.append('mode', evaluationMode);

            if (evaluationMode === 'job-description') {
                formData.append('jobDescription', jobDescription || jobLink);
            } else if (evaluationMode === 'target-role') {
                formData.append('targetRole', targetRole);
            } else {
                formData.append('targetRole', 'general');
            }

            const response = await axios.post('/api/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setAnalysisResult(response.data);
            navigate('/results');
        } catch (err) {
            console.error('Analysis error:', err);

            // Show toast for validation errors
            if (err.response?.data?.isToast) {
                toast.error(err.response.data.message || err.response.data.error, {
                    duration: 5000,
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }
                });
            } else {
                setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="landing-page">
            <div className="container">
                {/* Hero Section */}
                <header className="hero fade-in">
                    <h1 className="hero-title">
                        <span className="gradient-text">ResumeLens</span>
                    </h1>
                    <p className="hero-subtitle">
                        Get instant, explainable ATS scores with AI-powered suggestions
                    </p>
                    <div className="hero-badges">
                        <span className="badge">✨ AI-Powered Scoring</span>
                        <span className="badge">🎯 Human-Like Analysis</span>
                        <span className="badge">🔒 100% Private</span>
                    </div>
                </header>

                {/* Toast Container */}
                <Toaster position="top-right" />

                {/* Main Form */}
                <form className="evaluation-form fade-in" onSubmit={handleSubmit}>
                    {/* File Upload */}
                    <section className="form-section">
                        <h2 className="section-title">Upload Your Resume</h2>
                        <FileUpload
                            onFileSelect={setSelectedFile}
                            selectedFile={selectedFile}
                        />
                    </section>

                    {/* Evaluation Mode Selection */}
                    <section className="form-section">
                        <h2 className="section-title">Choose Evaluation Mode</h2>
                        <div className="mode-selector">
                            <label className={`mode-card ${evaluationMode === 'job-description' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="job-description"
                                    checked={evaluationMode === 'job-description'}
                                    onChange={(e) => setEvaluationMode(e.target.value)}
                                />
                                <div className="mode-icon">📋</div>
                                <h3>Job Description</h3>
                                <p>Match against a specific job posting</p>
                            </label>

                            <label className={`mode-card ${evaluationMode === 'target-role' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="target-role"
                                    checked={evaluationMode === 'target-role'}
                                    onChange={(e) => setEvaluationMode(e.target.value)}
                                />
                                <div className="mode-icon">🎯</div>
                                <h3>Target Role</h3>
                                <p>Evaluate for a specific role type</p>
                            </label>

                            <label className={`mode-card ${evaluationMode === 'general' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="general"
                                    checked={evaluationMode === 'general'}
                                    onChange={(e) => setEvaluationMode(e.target.value)}
                                />
                                <div className="mode-icon">⚡</div>
                                <h3>General ATS</h3>
                                <p>Overall resume quality check</p>
                            </label>
                        </div>
                    </section>

                    {/* Conditional Inputs */}
                    {evaluationMode === 'job-description' && (
                        <section className="form-section slide-in">
                            <h2 className="section-title">Job Details</h2>
                            <div className="input-group">
                                <label className="label">Job Description</label>
                                <textarea
                                    className="textarea"
                                    placeholder="Paste the job description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    rows={6}
                                />
                            </div>
                            <div className="input-divider">
                                <span>OR</span>
                            </div>
                            <div className="input-group">
                                <label className="label">Job Link (Optional)</label>
                                <input
                                    type="url"
                                    className="input"
                                    placeholder="https://example.com/job-posting"
                                    value={jobLink}
                                    onChange={(e) => setJobLink(e.target.value)}
                                />
                                <p className="input-hint">We'll use the description above if both are provided</p>
                            </div>
                        </section>
                    )}

                    {evaluationMode === 'target-role' && (
                        <section className="form-section slide-in">
                            <h2 className="section-title">Select Target Role</h2>
                            <select
                                className="select"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                            >
                                <option value="">Choose a role...</option>
                                {roles.map(role => (
                                    <option key={role.key} value={role.key}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </section>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                Analyzing Resume...
                            </>
                        ) : (
                            <>
                                Check ATS Score
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Features */}
                <section className="features fade-in">
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Transparent Scoring</h3>
                        <p>Deterministic algorithm you can trust</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Detailed Breakdown</h3>
                        <p>See exactly what helps or hurts your score</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💡</div>
                        <h3>AI Suggestions</h3>
                        <p>Get personalized improvement tips</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
