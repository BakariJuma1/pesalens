import logging
from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import limiter

logging.basicConfig(level=logging.INFO)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    limiter.init_app(app)

    from routes.health import health_bp
    from routes.analyze import analyze_bp
    from routes.debug import debug_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(debug_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
