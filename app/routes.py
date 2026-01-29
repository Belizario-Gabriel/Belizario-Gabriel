from flask import Blueprint, render_template, request

from app.db import get_db
from app.simulation.engine import TeamContext, simulate_match

main = Blueprint("main", __name__)


def load_team_context(club_id: int, home_advantage: float) -> TeamContext:
    db = get_db()
    club = db.execute("SELECT * FROM clubs WHERE id = ?", (club_id,)).fetchone()
    players = db.execute(
        "SELECT AVG(technical) AS technical, AVG(mental) AS mental, "
        "AVG(physical) AS physical, AVG(experience) AS experience "
        "FROM players WHERE club_id = ?",
        (club_id,),
    ).fetchone()

    return TeamContext(
        name=club["name"],
        technical=players["technical"],
        mental=players["mental"],
        physical=players["physical"],
        experience=players["experience"],
        cohesion=club["cohesion"],
        form=72,
        fatigue=35,
        age_curve=70,
        home_advantage=home_advantage,
        importance=75,
    )


@main.route("/")
def index():
    db = get_db()
    clubs = db.execute("SELECT * FROM clubs ORDER BY name").fetchall()
    matches = db.execute(
        "SELECT m.id, c1.name as home_name, c2.name as away_name, "
        "m.home_goals, m.away_goals, m.summary, m.created_at "
        "FROM matches m "
        "JOIN clubs c1 ON c1.id = m.home_club_id "
        "JOIN clubs c2 ON c2.id = m.away_club_id "
        "ORDER BY m.id DESC LIMIT 5"
    ).fetchall()
    return render_template("index.html", clubs=clubs, matches=matches)


@main.route("/simulate", methods=["POST"])
def simulate():
    home_id = int(request.form["home_id"])
    away_id = int(request.form["away_id"])

    home_team = load_team_context(home_id, home_advantage=65)
    away_team = load_team_context(away_id, home_advantage=0)

    result = simulate_match(home_team, away_team)

    db = get_db()
    db.execute(
        "INSERT INTO matches (home_club_id, away_club_id, home_goals, away_goals, summary) "
        "VALUES (?, ?, ?, ?, ?)",
        (home_id, away_id, result.home_goals, result.away_goals, result.summary),
    )
    db.commit()

    return render_template(
        "result.html",
        result=result,
        home_team=home_team,
        away_team=away_team,
    )
