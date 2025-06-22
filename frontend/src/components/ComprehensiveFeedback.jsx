import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ComprehensiveFeedback.css";

const ComprehensiveFeedback = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sessions/${sessionId}/feedback`);
        setFeedback(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching comprehensive feedback:", err);
        setError("Failed to load feedback. Please try again.");
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchFeedback();
    } else {
      setError("No session ID provided");
      setLoading(false);
    }
  }, [sessionId]);

  const handleReturnHome = () => {
    navigate("/");
  };

  const handleViewAllSessions = () => {
    navigate("/sessions");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Generating your comprehensive feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={handleReturnHome}>
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-container_comp">
     

      <div className="feedback-header">
        <h1>Comprehensive Interview Analysis</h1>
        <p>Detailed feedback based on your complete interview session</p>
       
      </div>

      <div className="comprehensive-analysis">
        <div className="comprehensive-analysis-header">
          <h2>Performance Overview</h2>
        </div>

        <div className="feedback-content">
          <div className="feedback-section">
            <h3>
              <span className="icon">📊</span>
              Analysis Summary
            </h3>
            <p>{feedback?.comprehensive_feedback}</p>
          </div>
        </div>

        <div className="feedback-meta">
          <div className="feedback-meta-item">
            <span className="feedback-meta-icon">📝</span>
            <span>Session ID: {sessionId}</span>
          </div>
          <div className="feedback-meta-item">
            <span className="feedback-meta-icon">📈</span>
            <span>Responses Analyzed: {feedback?.responses_count}</span>
          </div>
        </div>
      </div>

      <div className="feedback-actions">
        <button className="btn btn-secondary" onClick={handleReturnHome}>
          Return to Home
        </button>
        <button className="btn btn-primary" onClick={handleViewAllSessions}>
          View All Sessions
        </button>
      </div>
    </div>
  );
};

export default ComprehensiveFeedback;
