import json
import logging
import random
from pathlib import Path
from transformers import pipeline
from flask import current_app
import time
import cohere

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def load_sentiment_model():
    """Load the sentiment analysis model once at startup"""
    try:
        logger.info("Loading sentiment analysis model...")
        start_time = time.time()
        model = pipeline(
            task="sentiment-analysis", 
            model="nlptown/bert-base-multilingual-uncased-sentiment"
        )
        logger.info(f"Model loaded in {time.time() - start_time:.2f} seconds")
        return model
    except Exception as e:
        logger.error(f"Failed to load sentiment model: {str(e)}")
        raise

def load_questions():
    """Load questions from JSON file"""
    try:
        questions_path = current_app.config['QUESTIONS_PATH']
        with open(questions_path, "r") as f:
            questions = json.load(f)
        return questions
    except Exception as e:
        logger.error(f"Failed to load questions: {str(e)}")
        return []

# Dictionary of military-specific phrases for rule-based feedback
MILITARY_STRENGTHS = [
    "leadership potential",
    "strategic thinking",
    "discipline and focus",
    "team coordination skills",
    "problem-solving abilities",
    "adaptability under pressure",
    "effective communication",
    "decisiveness in challenging situations",
    "self-motivation and perseverance",
    "attention to detail",
    "situational awareness",
    "physical and mental resilience",
    "ethical decision-making"
]

IMPROVEMENT_SUGGESTIONS = [
    "incorporate more military-specific terminology",
    "provide concrete examples of leadership",
    "demonstrate a clearer command presence",
    "structure your response more systematically",
    "explain your decision-making process more clearly",
    "address potential challenges more proactively",
    "highlight teamwork experiences more prominently",
    "emphasize discipline and accountability",
    "demonstrate greater awareness of military protocols",
    "show more confidence in your delivery",
    "better articulate your long-term career goals",
    "highlight physical fitness and mental resilience"
]

POSITIVE_TEMPLATES = [
    "Your response demonstrates strong {strength_1}. I appreciate your emphasis on {strength_2}, which is crucial for military leadership. To further enhance your interview performance, consider how you might {improvement_1}. Additionally, try to {improvement_2} in your next responses. Overall, your answer shows promising officer qualities.",

    "I'm impressed by your {strength_1}, which is evident throughout your response. Your {strength_2} would serve you well in a military context. For even stronger responses, I recommend you {improvement_1}. Also, consider how you could {improvement_2} to better align with SSB expectations. Keep maintaining this positive approach.",

    "Your response excellently showcases your {strength_1}, a quality highly valued in defense services. Your {strength_2} also stands out positively. To elevate your performance further, work on ways to {improvement_1}. Additionally, try to {improvement_2} for more impactful answers. You're on the right track for SSB success."
]

NEUTRAL_TEMPLATES = [
    "Your response shows moderate {strength_1}, which is a good foundation. I can also see elements of {strength_2} in your answer. To strengthen your interview performance, I strongly recommend you {improvement_1}. It would also be beneficial to {improvement_2} in future responses. With these adjustments, your answers will better align with SSB expectations.",

    "I notice your {strength_1} in this response, which is important. There's also some evidence of {strength_2}, though it could be emphasized more. To significantly improve, focus on ways to {improvement_1}. Additionally, make sure to {improvement_2} to make your responses more compelling. These changes will help demonstrate your officer potential.",

    "Your answer shows some {strength_1}, which is a good starting point. I also see potential in your {strength_2}. For a stronger SSB performance, it's important that you {improvement_1}. Also work on ways to {improvement_2} in your upcoming responses. With these improvements, you'll better showcase your military leadership qualities."
]

NEGATIVE_TEMPLATES = [
    "While your response touches on some relevant points, it needs stronger demonstration of {strength_1}. Try to incorporate more {strength_2} in your answers, as these are essential qualities for military officers. It's critical that you {improvement_1} in future responses. Additionally, focus on ways to {improvement_2}. With dedicated practice on these areas, you can significantly improve your SSB interview performance.",

    "Your answer would benefit from more clearly demonstrating {strength_1}, which is highly valued in defense services. I recommend developing your {strength_2} more explicitly in your responses. To substantially improve, you should {improvement_1} and make sure to {improvement_2}. These changes will help transform your responses to better match SSB expectations.",

    "I encourage you to strengthen your demonstration of {strength_1} in your responses, as this is crucial for military leadership. Also work on showcasing your {strength_2} more effectively. For significant improvement, it's essential that you {improvement_1}. Additionally, focus on ways to {improvement_2}. With concentrated effort on these areas, your interview performance will show marked improvement."
]

def generate_rule_based_feedback(response_text, sentiment_label, sentiment_score):
    """Generate short, focused feedback based on the actual response content"""
    try:
        logger.info("Generating concise rule-based feedback")
        
        # Default to neutral if sentiment is missing or invalid
        if not sentiment_label or not isinstance(sentiment_label, str):
            sentiment_label = "3 stars"
            logger.warning(f"Invalid sentiment_label: {sentiment_label}, defaulting to '3 stars'")
        
        if not sentiment_score or not isinstance(sentiment_score, (int, float)):
            sentiment_score = 0.5
            logger.warning(f"Invalid sentiment_score: {sentiment_score}, defaulting to 0.5")
        
        # Analysis of response content (simplified for brevity)
        words = response_text.lower().split()
        word_count = len(words)
        
        # Check for military-related keywords
        military_keywords = ['leadership', 'duty', 'honor', 'country', 'service', 'discipline', 
                            'team', 'mission', 'strategy', 'command', 'fitness', 'integrity']
        
        found_keywords = [word for word in military_keywords if word in words]
        
        # Generate focused, concise feedback
        feedback = ""
        
        # Sentiment-based personalization
        if sentiment_label in ["1 star", "2 stars"] or sentiment_label.lower().split()[0] in ["1", "2"]:
            # Negative sentiment feedback
            if found_keywords:
                feedback = f"Your mention of {', '.join(found_keywords[:2])} shows potential, but your response needs more confidence and structure. Try using specific examples to demonstrate your understanding of military values."
            elif word_count < 20:
                feedback = "Your answer is too brief and lacks conviction. Expand on your thoughts and incorporate military leadership concepts to strengthen your response."
            else:
                feedback = "Your response could be more positive and focused. Highlight your strengths and demonstrate how your qualities align with military leadership values."
        
        elif sentiment_label == "3 stars" or sentiment_label.lower().split()[0] == "3":
            # Neutral sentiment feedback
            if found_keywords:
                feedback = f"Good mention of {', '.join(found_keywords[:2])}, but elaborate more on how these concepts apply to you personally. Be more specific and show greater enthusiasm in your delivery."
            elif word_count < 30:
                feedback = "Your answer is adequately structured but needs more depth. Include specific examples that highlight your leadership abilities and commitment to service."
            else:
                feedback = "Your response is balanced but could be more impactful. Focus on conveying your points with greater confidence and clarity to stand out."
        
        else:
            # Positive sentiment feedback
            if found_keywords:
                feedback = f"Excellent use of {', '.join(found_keywords[:2])} in your response. Your answer demonstrates good understanding of military values. Consider adding one specific personal example for even greater impact."
            elif word_count > 50:
                feedback = "Strong, well-articulated response. To improve further, be slightly more concise while maintaining your positive energy and confidence."
            else:
                feedback = "Your positive attitude comes through clearly. Build on this by incorporating more specific military terminology and structured examples in future responses."
        
        logger.info(f"Generated concise feedback: {feedback}")
        return feedback
    
    except Exception as e:
        logger.error(f"Error in rule-based feedback generation: {str(e)}")
        # Ultimate fallback - never fail, keep it short
        return "Focus on being more specific and incorporating military leadership examples in your answers. Maintain confidence in your delivery."

def generate_feedback(response_text, sentiment_label, sentiment_score):
    """Generate brief, personalized feedback based on the response content"""
    # Validate inputs
    if not response_text or not isinstance(response_text, str):
        logger.error(f"Invalid response_text: {type(response_text)}")
        return "Please provide a valid response for feedback."
    
    if len(response_text.strip()) < 10:
        return "Your response is too short. Please provide a more detailed answer."
    
    # Default values if missing
    if not sentiment_label or not isinstance(sentiment_label, str):
        sentiment_label = "3 stars"
        logger.warning(f"Invalid sentiment_label: {sentiment_label}, defaulting to '3 stars'")
    
    if not isinstance(sentiment_score, (int, float)):
        sentiment_score = 0.5
        logger.warning(f"Invalid sentiment_score: {sentiment_score}, defaulting to 0.5")
    
    try:
        # Initialize Cohere client
        api_key = current_app.config.get('COHERE_API_KEY')
        if not api_key:
            logger.error("Cohere API key not found in configuration")
            return generate_rule_based_feedback(response_text, sentiment_label, sentiment_score)
        
        co = cohere.Client(api_key)
        
        # Map sentiment labels to descriptive terms
        if sentiment_label in ["1 star", "2 stars"] or sentiment_label.lower().split()[0] in ["1", "2"]:
            sentiment_desc = "negative"
        elif sentiment_label == "3 stars" or sentiment_label.lower().split()[0] == "3":
            sentiment_desc = "neutral"
        else:
            sentiment_desc = "positive"
        
        # Truncate response if too long
        max_response_length = 800
        truncated_response = response_text
        if len(response_text) > max_response_length:
            truncated_response = response_text[:max_response_length] + "..."
            logger.info(f"Truncated response from {len(response_text)} to {len(truncated_response)} characters")
        
        # Create a prompt for brief, targeted feedback
        prompt = f"""As an SSB interview coach, give very brief feedback (3-4 lines maximum) on this candidate response:

RESPONSE: "{truncated_response}"

SENTIMENT: {sentiment_desc} (score: {sentiment_score:.2f})

Make your feedback:
1. Specific to what the candidate actually said
2. Focused on 1-2 key points only
3. Actionable but concise
4. Relevant to military officer selection
5. MAXIMUM 3-4 LINES TOTAL

Example format: "Your mention of [specific concept from response] shows [strength]. Work on [one specific improvement] by [brief suggestion]."
"""
        
        logger.info("Generating brief AI feedback with Cohere...")
        
        try:
            # Call Cohere API with parameters for shorter output
            response = co.generate(
                prompt=prompt,
                max_tokens=150,  # Reduced for shorter feedback
                temperature=0.4,
                k=0,
                p=0.75,
                frequency_penalty=0.2,
                presence_penalty=0.1,
                stop_sequences=["\n\n"],  # Stop after one paragraph
                return_likelihoods='NONE'
            )
            
            # Process the response
            if hasattr(response, 'generations') and len(response.generations) > 0:
                ai_feedback = response.generations[0].text.strip()
                
                # Validate response
                if not ai_feedback or len(ai_feedback) < 20:
                    logger.warning(f"Cohere returned too short feedback ({len(ai_feedback)} chars): '{ai_feedback}'")
                    return generate_rule_based_feedback(response_text, sentiment_label, sentiment_score)
                
                # Enforce length limit
                if len(ai_feedback) > 250:
                    ai_feedback = ai_feedback[:250].rsplit('. ', 1)[0] + '.'
                    logger.info(f"Truncated feedback to {len(ai_feedback)} chars")
                
                # Clean up formatting
                ai_feedback = ai_feedback.replace('#', '').replace('*', '')
                logger.info(f"Generated brief AI feedback: {ai_feedback}")
                
                return ai_feedback
            else:
                logger.warning("Cohere API returned empty response structure")
                return generate_rule_based_feedback(response_text, sentiment_label, sentiment_score)
                
        except Exception as cohere_error:
            logger.error(f"Cohere API error: {str(cohere_error)}")
            return generate_rule_based_feedback(response_text, sentiment_label, sentiment_score)
    
    except Exception as e:
        logger.error(f"Error in feedback generation: {str(e)}")
        return generate_rule_based_feedback(response_text, sentiment_label, sentiment_score)

