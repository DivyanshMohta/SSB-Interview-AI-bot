"""
Module for managing interview sessions and storing responses for end-of-interview feedback
"""
import json
import logging
import os
import time
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class InterviewSession:
    """Class to manage interview sessions and store responses"""
    
    def __init__(self, session_id=None):
        """Initialize a new interview session"""
        self.session_id = session_id or f"session_{int(time.time())}"
        self.responses = []
        self.start_time = datetime.now()
        self.session_dir = Path("interview_sessions")
        
        # Create session directory if it doesn't exist
        if not self.session_dir.exists():
            self.session_dir.mkdir(parents=True)
        
        logger.info(f"Created new interview session: {self.session_id}")
    
    def add_response(self, question_id, question_text, response_text, sentiment_label, sentiment_score, feedback):
        """Add a response to the session"""
        response_data = {
            "question_id": question_id,
            "question_text": question_text,
            "response_text": response_text,
            "sentiment": {
                "label": sentiment_label,
                "score": sentiment_score
            },
            "immediate_feedback": feedback,
            "timestamp": datetime.now().isoformat()
        }
        
        self.responses.append(response_data)
        self._save_session()
        
        logger.info(f"Added response to question {question_id} in session {self.session_id}")
        return response_data
    
    def get_all_responses(self):
        """Get all responses in the session"""
        return self.responses
    
    def _save_session(self):
        """Save the session to a file"""
        session_file = self.session_dir / f"{self.session_id}.json"
        
        session_data = {
            "session_id": self.session_id,
            "start_time": self.start_time.isoformat(),
            "responses": self.responses
        }
        
        with open(session_file, "w") as f:
            json.dump(session_data, f, indent=2)
        
        logger.info(f"Saved session {self.session_id} to {session_file}")
    
    @classmethod
    def load_session(cls, session_id):
        """Load a session from a file"""
        session_dir = Path("interview_sessions")
        session_file = session_dir / f"{session_id}.json"
        
        if not session_file.exists():
            logger.error(f"Session file {session_file} does not exist")
            return None
        
        try:
            with open(session_file, "r") as f:
                session_data = json.load(f)
            
            session = cls(session_id)
            session.responses = session_data["responses"]
            session.start_time = datetime.fromisoformat(session_data["start_time"])
            
            logger.info(f"Loaded session {session_id} from {session_file}")
            return session
        
        except Exception as e:
            logger.error(f"Error loading session {session_id}: {str(e)}")
            return None
    
    @classmethod
    def get_active_sessions(cls):
        """Get a list of all active session IDs"""
        session_dir = Path("interview_sessions")
        
        if not session_dir.exists():
            return []
        
        session_files = list(session_dir.glob("*.json"))
        session_ids = [f.stem for f in session_files]
        
        return session_ids
