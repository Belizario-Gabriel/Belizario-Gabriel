from dataclasses import dataclass
import math
import random


@dataclass
class TeamContext:
    name: str
    technical: float
    mental: float
    physical: float
    experience: float
    cohesion: float
    form: float
    fatigue: float
    age_curve: float
    home_advantage: float
    importance: float


@dataclass
class MatchResult:
    home_goals: int
    away_goals: int
    summary: str
    moments: list


def clamp(value, min_value=0.0, max_value=1.0):
    return max(min_value, min(max_value, value))


def calculate_team_base(team: TeamContext) -> float:
    technical_weight = 0.4
    mental_weight = 0.3
    physical_weight = 0.2
    experience_weight = 0.1

    base = (
        team.technical * technical_weight
        + team.mental * mental_weight
        + team.physical * physical_weight
        + team.experience * experience_weight
    )
    cohesion_factor = 0.85 + (team.cohesion / 100) * 0.3
    return base * cohesion_factor


def apply_context(base: float, team: TeamContext) -> float:
    form_factor = 0.9 + (team.form / 100) * 0.2
    fatigue_factor = 1.05 - (team.fatigue / 100) * 0.3
    age_factor = 0.9 + (team.age_curve / 100) * 0.2
    home_factor = 1.0 + (team.home_advantage / 100) * 0.08
    importance_factor = 0.95 + (team.importance / 100) * 0.1

    return base * form_factor * fatigue_factor * age_factor * home_factor * importance_factor


def compute_chance_volume(strength_diff: float) -> int:
    base_chances = 8
    bonus = int(strength_diff * 0.12)
    return max(4, min(16, base_chances + bonus))


def compute_conversion_rate(strength: float, opponent_strength: float) -> float:
    relative = strength / max(1.0, opponent_strength)
    return clamp(0.18 + math.log(relative + 1.0) * 0.08, 0.12, 0.38)


def simulate_match(home: TeamContext, away: TeamContext, seed: int | None = None) -> MatchResult:
    rng = random.Random(seed)

    home_base = calculate_team_base(home)
    away_base = calculate_team_base(away)

    home_strength = apply_context(home_base, home)
    away_strength = apply_context(away_base, away)

    strength_diff = home_strength - away_strength

    home_chances = compute_chance_volume(strength_diff)
    away_chances = compute_chance_volume(-strength_diff)

    home_conversion = compute_conversion_rate(home_strength, away_strength)
    away_conversion = compute_conversion_rate(away_strength, home_strength)

    home_goals = 0
    away_goals = 0
    moments = []

    for minute in range(5, 91, 5):
        momentum_shift = rng.uniform(-0.08, 0.08)
        home_momentum = clamp(0.5 + (strength_diff / 200) + momentum_shift)
        away_momentum = clamp(1.0 - home_momentum)

        if rng.random() < home_momentum:
            if home_chances > 0:
                home_chances -= 1
                if rng.random() < home_conversion:
                    home_goals += 1
                    moments.append(f"{minute}' Gol do {home.name} em ataque trabalhado.")
                else:
                    moments.append(f"{minute}' Chance clara do {home.name}, mas o goleiro salva.")
        else:
            if away_chances > 0:
                away_chances -= 1
                if rng.random() < away_conversion:
                    away_goals += 1
                    moments.append(f"{minute}' Gol do {away.name} em transição rápida.")
                else:
                    moments.append(f"{minute}' Finalização perigosa do {away.name} para fora.")

    summary = (
        f"{home.name} {home_goals} x {away_goals} {away.name} | "
        f"Chances: {home_chances + home_goals} vs {away_chances + away_goals}"
    )

    return MatchResult(home_goals=home_goals, away_goals=away_goals, summary=summary, moments=moments)
