import os
import sqlite3

from flask import current_app, g


def get_db():
    if "db" not in g:
        os.makedirs(os.path.dirname(current_app.config["DATABASE"]), exist_ok=True)
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app):
    def init():
        db = get_db()
        with app.open_resource("schema.sql") as schema_file:
            db.executescript(schema_file.read().decode("utf-8"))
        db.commit()

    @app.before_request
    def ensure_db():
        if not os.path.exists(app.config["DATABASE"]):
            init()

    app.teardown_appcontext(close_db)
