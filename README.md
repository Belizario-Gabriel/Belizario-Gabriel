# Simulador Liga Master Offline

Protótipo inicial de um jogo de futebol focado em simulação realista e gestão profunda, rodando 100% offline em localhost.

## Objetivos
- Simulação de partidas baseada em múltiplas camadas (atributos, contexto, momentos, aleatoriedade controlada).
- Persistência total de progresso via SQLite.
- Interface simples em HTML/CSS/JS com foco em gestão.

## Executar localmente

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Acesse `http://127.0.0.1:5000`.

## Estrutura
- `app/simulation/engine.py`: motor de simulação modular.
- `app/routes.py`: rotas de interface e criação de partidas.
- `app/schema.sql`: schema do banco e dados iniciais.
