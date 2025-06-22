import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import './SessionsList.css';

const SessionsList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/v1/sessions');
        setSessions(response.data.sessions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load interview sessions');
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleViewFeedback = (sessionId) => {
    navigate(`/feedback/${sessionId}`);
  };

  const handleViewSession = (sessionId) => {
    navigate(`/sessions/${sessionId}`);
  };

  const handleStartNewInterview = () => {
    // Create a new session
    axios.post('/api/v1/sessions/create')
      .then(response => {
        const sessionId = response.data.session_id;
        // Navigate to the interview page with the new session ID
        navigate(`/interview/${sessionId}`);
      })
      .catch(err => {
        console.error('Error creating new session:', err);
        setError('Failed to create a new interview session');
      });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your interview sessions...</p>
      </div>
    );
  }

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h1>Your Interview Sessions</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleStartNewInterview}
        >
          Start New Interview
        </button>
      </div>
      
      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}
      
      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2>No Sessions Found</h2>
          <p className="empty-state-text">
            You don't have any interview sessions yet. Start a new interview to begin!
          </p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((sessionId, index) => {
            // Extract timestamp from session ID if available
            const timestamp = sessionId.split('_')[1];
            const date = timestamp ? new Date(parseInt(timestamp) * 1000) : null;
            
            return (
              <div key={sessionId} className="session-card">
                <h3 className="session-title">
                  Interview Session {index + 1}
                </h3>
                
                {date && (
                  <div className="session-meta">
                    <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
                    <span>ID: {sessionId.substring(0, 8)}...</span>
                  </div>
                )}
                
                <div className="session-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleViewSession(sessionId)}
                  >
                    View Responses
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleViewFeedback(sessionId)}
                  >
                    View Comprehensive Feedback
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionsList;
