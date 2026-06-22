# Definicao Macro Dashboard

Dashboard estático para GitHub Pages com atualização automática de ativos de risco, segurança e neutro.

## Como funciona

- `index.html`, `style.css` e `script.js` renderizam o painel.
- `data/quotes.json` é a fonte consumida pelo front-end.
- `.github/workflows/update-quotes.yml` roda a cada 5 minutos.
- `scripts/update_quotes.py` atualiza os preços usando `yfinance`, scrape do minério na Sina e tenta scrape do volume D-1 da B3.

## Limites atuais

- A carteira do Investing enviada exige login, então o pipeline usa tickers públicos equivalentes do `yfinance`.
- **B3 Volume D-1 (`VOL_D1`):** Tenta raspar dados de sites de notícias financeiras (ex: InfoMoney), mas esta abordagem é frágil e sujeita a quebras se a estrutura do site mudar. A variação percentual (`change_pct`) não é calculada automaticamente para este ativo devido à complexidade de obter dados históricos.
- **B3 Posição dos Estrangeiros 10k+ (`FGP`):** Permanece como fallback, pois não foi encontrada uma fonte pública estável e automatizada para este dado.
- **Dow Jones Shanghai (`.DJSH`):** Permanece como fallback, pois não foi encontrado um ticker equivalente no `yfinance` ou uma fonte pública estável.
- **China A50 Futuros (`CHINA50`):** Atualmente usa o Shanghai Composite (`000001.SS`) como proxy via `yfinance`. Se um ticker mais específico for encontrado, pode ser atualizado.

## Publicação

Use GitHub Pages na branch `main`, pasta `/ (root)`.
