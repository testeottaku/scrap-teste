# anime-scraper-vercel

Projeto adaptado para Vercel.

## Como publicar

### Opção 1 — GitHub + Vercel
1. Envie esta pasta para um repositório no GitHub.
2. No painel da Vercel, clique em **Add New > Project**.
3. Importe o repositório.
4. Clique em **Deploy**.

### Opção 2 — CLI da Vercel
```bash
npm i -g vercel
vercel --prod
```

## Estrutura
- `index.html`: frontend
- `api/anime.js`: função serverless que faz o scraping
- `vercel.json`: config básica da Vercel

## Observação
Se o site alvo mudar HTML, bloquear IP da Vercel ou alterar domínio, o scraping pode parar de funcionar e será preciso ajustar os seletores.
