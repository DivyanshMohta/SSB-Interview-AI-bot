# import secrets
# print(secrets.token_hex(24))  # Generates a 48-character hexadecimal string
# 7ce60dfff764d7ec57a9799bcc8a79c583f12bc2036d841a
# wqSCS77gDhz5rajzgJpYzXKfq9L2G2LjTpuB4Osa

class Config:
    DEBUG = False
    TESTING = False
    SECRET_KEY = "7ce60dfff764d7ec57a9799bcc8a79c583f12bc2036d841aasdsd"
    MODEL_PATH = 'models/sentiment'
    QUESTIONS_PATH = 'app/questions.json'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
    COHERE_API_KEY = "asdasdwqSCS77gDhz5rajzgJpYzXKfq9L2G2LjTpuB4Osa"
    
    
class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    # Production specific settings
    pass

class TestingConfig(Config):
    TESTING = True