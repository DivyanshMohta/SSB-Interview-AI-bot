from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    from .routes import app_routes
    app.register_blueprint(app_routes)

    return app


    [
      "1 .Tell me about yourself.",
      "2. Why do you want to join the armed forces?",
      "3. What are your strengths and weaknesses?",
      "4. Describe a challenging situation and how you handled it.",
      "5. Where do you see yourself in 5 years?", 
      "6. Why do u want to pass this interview?",
      "7. Why so u ",
      "8. want to pass this interview?",
      "9. W want to pass ?",
      "10. interview should be conducted or not? ur opinion on it?"
    ]
    
    from flask import Blueprint, request, jsonify
import json
from .utils import generate_feedback

from transformers import pipeline;

import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

sentiment_analyzer = pipeline(task="sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

app_routes = Blueprint("app_routes", __name__)

# Load questions from JSON
with open("app/questions.json", "r") as f:
    QUESTIONS = json.load(f)

@app_routes.route('/api/questions', methods=['GET'])
def get_questions():
    start = int(request.args.get('start', 0))
    limit = int(request.args.get('limit', 10))
    return jsonify({"questions": QUESTIONS[start:start+limit]}), 200

@app_routes.route('/api/analyze-response', methods=['POST'])
def analyze_response():
    try:
        data = request.json
        response_text = data.get("response", "")

        # Validate input
        if not response_text.strip():
            return jsonify({"error": "Response cannot be empty"}), 400

        # Analyze sentiment
        sentiment = sentiment_analyzer(response_text)
        sentiment_result = sentiment[0]
        sentiment_label = sentiment_result['label']
        sentiment_score = sentiment_result['score']

        # Generate feedback using the enhanced function
        feedback = generate_feedback(response_text, sentiment_label, sentiment_score)

        return jsonify({
            "response": response_text,
            "feedback": feedback,
            "sentiment": {
                "label": sentiment_label,
                "score": sentiment_score
            }
        }), 200

    except Exception as e:
        logging.error(f"Error in /api/analyze-response: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


        def generate_feedback(response_text, sentiment_label, sentiment_score):
        feedback = ""
    
        # Handling different sentiment models
        if sentiment_label in ["1 star", "2 stars"]:  
            mapped_sentiment = "negative"
        elif sentiment_label == "3 stars":
            mapped_sentiment = "neutral"
        elif sentiment_label in ["4 stars", "5 stars"]:
            mapped_sentiment = "positive"
        else:
            mapped_sentiment = sentiment_label.lower()
    
        if mapped_sentiment == "very positive":
            feedback = "Excellent! Your response is confident and well-structured. Keep up the great work!"
    
        elif mapped_sentiment == "positive":
            if sentiment_score > 0.8:
                feedback = "Good response! Adding a specific example or personal experience could make it even stronger."
            else:
                feedback = "Your response is positive, but it could be more detailed to sound more confident."
    
        elif mapped_sentiment == "neutral":
            if sentiment_score > 0.8:
                feedback = "Your response is balanced, but consider making your points stronger or adding more enthusiasm."
            else:
                feedback = "Your response sounds neutral, but it might lack impact. Try to sound more engaging and confident."
    
        elif mapped_sentiment == "negative":
            if sentiment_score > 0.8:
                feedback = "Your response seems overly negative. Try framing your points in a constructive way."
            elif sentiment_score > 0.5:
                feedback = "Your response has some negative tone. Try highlighting strengths and solutions."
            else:
                feedback = "Your response sounds unsure. Focus on your strengths and use confident language."
    
        elif mapped_sentiment == "very negative":
            if sentiment_score > 0.8:
                feedback = "Your response is too negative. Try rewording it to focus on strengths or solutions."
            else:
                feedback = "Your response may need a more optimistic tone. Reframe challenges as opportunities."
    
        else:
            feedback = "Your response was analyzed, but consider structuring it more clearly."
    
        return feedback
    