from flask import Flask
from flask_cors import CORS
from .utils import load_sentiment_model
import os

# Global instance of the model to avoid reloading for each request
sentiment_model = None

def create_app(config_class='config.DevelopmentConfig'):
    app = Flask(__name__)
    app.config.from_object(config_class)
    # In your Flask app initialization
    app.config['HF_API_TOKEN'] = os.environ.get('HF_API_TOKEN', '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')
    # Set Cohere API key from environment variable or config
    app.config['COHERE_API_KEY'] = os.environ.get('COHERE_API_KEY', app.config.get('COHERE_API_KEY'))
    
    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize model
    global sentiment_model
    sentiment_model = load_sentiment_model()
    
    # Register error handlers
    from .error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # Register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app