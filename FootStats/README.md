# FootStats

Projeto em **Next.js + TypeScript + Tailwind CSS** para busca global de futebol com dados da TheSportsDB.

## Funcionalidades
- Busca global por **jogador**, **time** e **liga**
- Página de detalhes do jogador
- Página de detalhes do time
- Lista de últimos jogos do time
- Favoritos com `localStorage`
- Debounce na busca
- API routes internas para consumir TheSportsDB
- Loading states e tratamento de erro

## Estrutura de pastas
```txt
FootStats/
  app/
    api/
      search/route.ts
      player/[id]/route.ts
      team/[id]/route.ts
    player/[id]/page.tsx
    team/[id]/page.tsx
    layout.tsx
    page.tsx
    globals.css
  components/
    SearchBar.tsx
    SearchResults.tsx
    FavoriteButton.tsx
    LoadingCard.tsx
  hooks/
    useFavorites.ts
  lib/
    constants.ts
    utils.ts
  services/
    sportsdb.ts
  types/
    sportsdb.ts
```

## Endpoints internos
- `GET /api/search?q=ronaldo`
- `GET /api/player/34145937`
- `GET /api/team/133604`

## Rodando localmente
```bash
cd FootStats
npm install
npm run dev
```

Acesse: `http://localhost:3000`

## Scripts úteis
```bash
npm run lint
npm run typecheck
npm run build
```

## Expansão futura (sugestões)
- paginação e infinite scroll na busca
- cache com Redis em produção
- autenticação para sincronizar favoritos
- internacionalização (pt/en/es)
