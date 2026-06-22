# Definicao Macro Dashboard

Dashboard estático para GitHub Pages com atualização automática de ativos de risco, segurança e neutro.

## Como funciona

- `index.html`, `style.css` e `script.js` renderizam o painel.
- `data/quotes.json` é a fonte consumida pelo front-end.
- `.github/workflows/update-quotes.yml` roda a cada 5 minutos.
- `scripts/update_quotes.py` atualiza os preços usando `yfinance` e scrape do minério na Sina.

## Limites atuais

- A carteira do Investing enviada exige login, então o pipeline usa tickers públicos equivalentes.
- A página da B3 mudou a localização dos dados de contratos em aberto; `FGP` e `VOL_D1` estão preparados para fallback até o parser específico ser refinado.

## Publicação

Use GitHub Pages na branch `main`, pasta `/ (root)`.
