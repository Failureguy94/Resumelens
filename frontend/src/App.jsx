import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ScoreResults from './components/ScoreResults';
import './App.css';

function App() {
    const [analysisResult, setAnalysisResult] = useState(null);

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={<LandingPage setAnalysisResult={setAnalysisResult} />}
                    />
                    <Route
                        path="/results"
                        element={<ScoreResults analysisResult={analysisResult} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
