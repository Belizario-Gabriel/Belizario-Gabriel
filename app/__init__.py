from flask import Flask

from app.db import init_db
from app.routes import main


def create_app():
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE="data/game.db",
        SECRET_KEY="dev",
    )

    init_db(app)
    app.register_blueprint(main)

    return app
