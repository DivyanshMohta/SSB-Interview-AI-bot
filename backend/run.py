from app import create_app
import os

if __name__ == "__main__":
    # Determine environment
    env = os.environ.get("FLASK_ENV", "development")
    
    # Create app with appropriate config
    if env == "production":
        app = create_app("config.ProductionConfig")
    else:
        app = create_app("config.DevelopmentConfig")
    
    # Run the app
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))