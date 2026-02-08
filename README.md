# Entertainment Tycoon Manager (Monorepo)

Web app-jogo de simulação empresarial por turnos (mensal), com saves múltiplos, concorrentes, eventos, crises, leilões de IP e árvore de tecnologia.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind + Recharts
- Backend: Node + Express + TypeScript + Zod
- Banco: Prisma com PostgreSQL **ou** fallback SQLite via env
- Auth: local email/senha com bcrypt + JWT
- Testes: Vitest (motor e smoke)

## Estrutura
```text
apps/
  api/  -> Express API, Prisma, engine (domain/sim)
  web/  -> React app com layout e páginas do jogo
```

## Configuração
```bash
npm install
```

### Variáveis (apps/api/.env)
```env
PORT=3001
JWT_SECRET=troque-este-segredo
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

Para PostgreSQL:
```env
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://user:pass@localhost:5432/tycoon"
```

## Banco (migration/seed)
```bash
npm run db:migrate
npm run db:seed
```

## Executar
```bash
npm run api    # API http://localhost:3001
npm run dev    # WEB http://localhost:5173
```

## Scripts principais
- `npm run test` roda testes dos workspaces.
- `npm run build` build completo.

## Funcionalidades implementadas
- Auth (`/auth/register`, `/auth/login`) e criação/carregamento de saves.
- Motor de simulação determinístico por seed em `apps/api/src/domain/sim/engine.ts`.
- Avanço de turno mensal (`/turn/advance`) com receitas/custos/churn/crescimento/valuation.
- Concorrência simples, crises condicionais e log de eventos.
- Tech tree (`/tech`, `/tech/queue`), leilões/IP (`/auctions/current`, `/auctions/:id/bid`), crises (`/crises`, `/crises/:id/respond`).
- Ledger financeiro, snapshots mensais e relatório CSV.
- Frontend com onboarding de novo jogo, sidebar completa, dashboard KPIs + gráfico, módulos MVP/extras navegáveis.

## Observações
- Seed cria regiões, techs, IPs e produções base fictícias.
- Save/Load reconstruído via snapshot mensal + entidades relacionadas.
- Dificuldades: `sandbox`, `normal`, `hardcore` alteram caixa inicial e pressão/risco.
