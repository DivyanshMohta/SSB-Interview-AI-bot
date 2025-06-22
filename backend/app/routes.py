from flask import Blueprint, request, jsonify, current_app, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import Schema, fields, validate, ValidationError
from .utils import generate_feedback, generate_rule_based_feedback, load_questions
from .interview_session import InterviewSession
import logging

logger = logging.getLogger(__name__)

# Create blueprint
api_bp = Blueprint("api", __name__)

# Request validation schemas
class AnalyzeResponseSchema(Schema):
    """Schema for validating the analyze-response API endpoint request."""
    class Meta:
        """Meta options for the schema."""
        # Use EXCLUDE constant from marshmallow instead of string
        unknown = 'exclude'  # Changed from "EXCLUDE" to lowercase 'exclude'
    
    response = fields.String(required=True, validate=validate.Length(min=1))
    question_id = fields.String(required=False, allow_none=True, missing="unknown")
    question_text = fields.String(required=False, allow_none=True, missing="")
    session_id = fields.String(required=False, allow_none=True)

class SessionSchema(Schema):
    session_id = fields.String(required=True)

# Configure rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@api_bp.route('/questions', methods=['GET'])
@limiter.limit("60 per minute")
def get_questions():
    try:
        # Get query parameters with defaults
        start = request.args.get('start', default=0, type=int)
        limit = request.args.get('limit', default=10, type=int)
        
        # Validate parameters
        if start < 0:
            return jsonify({"error": "Start index cannot be negative"}), 400
        if limit < 1 or limit > 50:
            return jsonify({"error": "Limit must be between 1 and 50"}), 400
        
        # Get questions
        questions = load_questions()
        
        # Apply pagination
        paginated_questions = questions[start:start+limit]
        
        return jsonify({
            "questions": paginated_questions,
            "total": len(questions),
            "start": start,
            "limit": limit
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_questions: {str(e)}")
        return jsonify({"error": "Failed to retrieve questions"}), 500


@api_bp.route('/analyze-response', methods=['POST'])
@limiter.limit("30 per minute")
def analyze_response():
    """Analyze user response and provide AI-generated feedback"""
    try:
        # Log the incoming request data for debugging
        logger.info(f"Received analyze request: {request.json}")
        
        # Pre-process data to ensure valid types
        request_data = {}
        if request.json:
            # Convert to string or set to default values
            if 'response' in request.json:
                request_data['response'] = str(request.json['response'])
            
            if 'question_id' in request.json:
                if request.json['question_id'] is not None:
                    request_data['question_id'] = str(request.json['question_id'])
                else:
                    request_data['question_id'] = "unknown"
            
            if 'question_text' in request.json:
                if request.json['question_text'] is not None:
                    request_data['question_text'] = str(request.json['question_text'])
                else:
                    request_data['question_text'] = ""
            
            if 'session_id' in request.json:
                if request.json['session_id'] is not None:
                    request_data['session_id'] = str(request.json['session_id'])
        
        logger.info(f"Pre-processed request data: {request_data}")
        
        # Validate request data
        schema = AnalyzeResponseSchema()
        try:
            data = schema.load(request_data)
        except ValidationError as err:
            logger.error(f"Validation error: {err.messages}")
            return jsonify({
                "error": "Invalid request data",
                "details": err.messages
            }), 400
        
        response_text = data.get("response", "")
        question_id = data.get("question_id", "unknown")
        question_text = data.get("question_text", "")
        session_id = data.get("session_id")
        
        # Validate response text
        if not response_text or not response_text.strip():
            logger.error("Empty response text received")
            return jsonify({
                "error": "Response text cannot be empty"
            }), 400
        
        logger.info(f"Processing response of length {len(response_text)} for question_id: {question_id}")
        
        # Get the global sentiment model instance
        try:
            from . import sentiment_model
            
            # Analyze sentiment directly
            sentiment_result = sentiment_model(response_text)
            logger.info(f"Sentiment analysis completed: {sentiment_result}")
            
            sentiment_label = sentiment_result[0]['label']
            sentiment_score = sentiment_result[0]['score']
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            # Provide default sentiment values rather than failing
            sentiment_label = "3 stars"
            sentiment_score = 0.5
            logger.info("Using default sentiment values due to error")
        
        # Generate feedback
        try:
            logger.info(f"Generating feedback with sentiment: {sentiment_label} ({sentiment_score:.2f})")
            feedback = generate_feedback(response_text, sentiment_label, sentiment_score)
            
            if not feedback or len(feedback.strip()) < 10:
                logger.warning("Empty or very short feedback generated")
                feedback = "We're experiencing technical difficulties generating feedback. Please try again with a more detailed response."
        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return jsonify({
                "error": "Failed to generate feedback",
                "message": "Our feedback system is temporarily unavailable. Please try again later."
            }), 500
        
        # Store in session if session_id provided
        if session_id:
            try:
                # Try to load existing session
                interview_session = InterviewSession.load_session(session_id)
                
                # If session doesn't exist, create a new one
                if not interview_session:
                    interview_session = InterviewSession(session_id)
                    logger.info(f"Created new session: {session_id}")
                
                # Add response to session
                interview_session.add_response(
                    question_id=question_id,
                    question_text=question_text,
                    response_text=response_text,
                    sentiment_label=sentiment_label,
                    sentiment_score=sentiment_score,
                    feedback=feedback
                )
                
                logger.info(f"Stored response in session {session_id}")
            except Exception as e:
                # Log but don't fail the request
                logger.error(f"Error storing response in session: {str(e)}")
        
        # Return the successful response
        logger.info(f"Successfully generated feedback of length {len(feedback)}")
        return jsonify({
            "response": response_text,
            "feedback": feedback,
            "sentiment": {
                "label": sentiment_label,
                "score": sentiment_score
            },
            "session_id": session_id
        }), 200
    
    except Exception as e:
        # Catch-all for any unexpected errors
        logger.error(f"Unexpected error in analyze_response: {str(e)}")
        return jsonify({
            "error": "An unexpected error occurred",
            "message": "Please try again"
        }), 500


@api_bp.route('/sessions/create', methods=['POST'])
@limiter.limit("10 per minute")
def create_session():
    """Create a new interview session"""
    try:
        # Create a new session
        interview_session = InterviewSession()
        
        return jsonify({
            "session_id": interview_session.session_id,
            "message": "Session created successfully"
        }), 201
    
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        return jsonify({"error": "Failed to create session"}), 500


@api_bp.route('/sessions/<session_id>', methods=['GET'])
@limiter.limit("30 per minute")
def get_session(session_id):
    """Get all responses in a session"""
    try:
        # Load the session
        interview_session = InterviewSession.load_session(session_id)
        
        if not interview_session:
            return jsonify({"error": "Session not found"}), 404
        
        # Get all responses
        responses = interview_session.get_all_responses()
        
        return jsonify({
            "session_id": session_id,
            "responses": responses
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting session: {str(e)}")
        return jsonify({"error": "Failed to get session"}), 500


@api_bp.route('/sessions', methods=['GET'])
@limiter.limit("30 per minute")
def get_sessions():
    """Get a list of all active sessions"""
    try:
        # Get all active sessions
        session_ids = InterviewSession.get_active_sessions()
        
        return jsonify({
            "sessions": session_ids
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting sessions: {str(e)}")
        return jsonify({"error": "Failed to get sessions"}), 500


@api_bp.route('/sessions/<session_id>/feedback', methods=['GET'])
@limiter.limit("10 per minute")
def get_comprehensive_feedback(session_id):
    """Generate comprehensive feedback for all responses in a session"""
    try:
        # Load the session
        interview_session = InterviewSession.load_session(session_id)
        
        if not interview_session:
            return jsonify({"error": "Session not found"}), 404
        
        # Get all responses
        responses = interview_session.get_all_responses()
        
        if not responses:
            return jsonify({"error": "No responses found in session"}), 404
        
        # Generate comprehensive feedback using Cohere
        try:
            from . import sentiment_model
            
            # Get the Cohere client
            import cohere
            api_key = current_app.config.get('COHERE_API_KEY')
            co = cohere.Client(api_key)
            
            # Prepare the prompt for comprehensive feedback
            prompt = "As an SSB (Services Selection Board) interview coach, provide comprehensive feedback on the following candidate responses:\n\n"
            
            for i, response in enumerate(responses):
                prompt += f"Question {i+1}: {response.get('question_text', 'Unknown question')}\n"
                prompt += f"Response: \"{response.get('response_text', '')}\"\n"
                prompt += f"Sentiment: {response.get('sentiment', {}).get('label', 'neutral')}\n\n"
            
            prompt += """
            Please provide comprehensive feedback that:
            1. Identifies overall strengths across all responses
            2. Points out areas for improvement
            3. Offers specific advice for better interview performance
            4. Is encouraging and supportive
            
            Structure your feedback in clear sections and be specific in your recommendations.
            """
            
            # Generate response using Cohere
            logger.info("Generating comprehensive feedback with Cohere...")
            response = co.generate(
                prompt=prompt,
                max_tokens=500,  # Longer for comprehensive feedback
                temperature=0.7,
                k=0,
                stop_sequences=[],
                return_likelihoods='NONE'
            )
            
            # Extract and clean the generated text
            if hasattr(response, 'generations') and len(response.generations) > 0:
                comprehensive_feedback = response.generations[0].text.strip()
                
                # Clean up the feedback
                comprehensive_feedback = comprehensive_feedback.replace('#', '').replace('*', '')
                
                logger.info(f"Generated comprehensive feedback: {comprehensive_feedback[:100]}...")
            else:
                logger.warning("Cohere API returned an empty or invalid response for comprehensive feedback")
                comprehensive_feedback = "We couldn't generate comprehensive feedback at this time."
        
        except Exception as e:
            logger.error(f"Error generating comprehensive feedback: {str(e)}")
            comprehensive_feedback = "We encountered an error while generating comprehensive feedback."
        
        return jsonify({
            "session_id": session_id,
            "comprehensive_feedback": comprehensive_feedback,
            "responses_count": len(responses)
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting comprehensive feedback: {str(e)}")
        return jsonify({"error": "Failed to get comprehensive feedback"}), 500