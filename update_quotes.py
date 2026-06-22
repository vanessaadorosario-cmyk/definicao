import json
import re
from datetime import datetime, timezone

import requests
import yfinance as yf
from bs4 import BeautifulSoup

ASSETS = {
    "HG": {"ticker": "HG=F", "source": "yfinance"},
    "CL": {"ticker": "CL=F", "source": "yfinance"},
    ".OSEAX": {"ticker": "OSEAX.OL", "source": "yfinance"},
    "ZS": {"ticker": "ZS=F", "source": "yfinance"},
    "YMH26": {"ticker": "YM=F", "source": "yfinance"},
    ".GDOW": {"ticker": "^GDOW", "source": "yfinance"},
    "VALE.K": {"ticker": "VALE", "source": "yfinance"},
    "PBR": {"ticker": "PBR", "source": "yfinance"},
    "EWZ": {"ticker": "EWZ", "source": "yfinance"},
    "XLF": {"ticker": "XLF", "source": "yfinance"},
    "XLP": {"ticker": "XLP", "source": "yfinance"},
    "XLE": {"ticker": "XLE", "source": "yfinance"},
    "XME": {"ticker": "XME", "source": "yfinance"},
    "EEM": {"ticker": "EEM", "source": "yfinance"},
    "SOXX.O": {"ticker": "SOXX", "source": "yfinance"},
    ".BSESN": {"ticker": "^BSESN", "source": "yfinance"},
    "VLO": {"ticker": "VLO", "source": "yfinance"},
    "DX": {"ticker": "DX-Y.NYB", "source": "yfinance"},
    "VX": {"ticker": "^VIX", "source": "yfinance"},
    "USD/MXN": {"ticker": "USDMXN=X", "source": "yfinance"},
    "USD/NOK": {"ticker": "USDNOK=X", "source": "yfinance"},
    "USD/NZD": {"ticker": "NZDUSD=X", "source": "derived", "invert": True},
    "USD/AUD": {"ticker": "AUDUSD=X", "source": "derived", "invert": True},
    "USD/KRW": {"ticker": "USDKRW=X", "source": "yfinance"},
    "USD/CNY": {"ticker": "USDCNY=X", "source": "yfinance"},
    "EUR/BRL": {"ticker": "EURBRL=X", "source": "yfinance"},
    ".SZI": {"ticker": "399001.SZ", "source": "yfinance"},
    ".SSEC": {"ticker": "000001.SS", "source": "yfinance"},
    "HSIQF6": {"ticker": "^HSI", "source": "yfinance"},
    "GC": {"ticker": "GC=F", "source": "yfinance"},
    # Ativos que serão tratados como proxy ou fallback
    ".DJSH": {"ticker": "DJSH_PROXY", "source": "proxy-fallback"}, # Mantido como fallback
    "CHINA50": {"ticker": "000001.SS", "source": "yfinance"}, # Usando Shanghai Composite como proxy para CHINA50
}

CHINA_BASKET = ["000001.SS", "399001.SZ", "^HSI"]

def quote_from_history(ticker):
    try:
        history = yf.Ticker(ticker).history(period="5d", interval="1d", auto_adjust=False)
        if history.empty or len(history.index) < 2:
            return None
        latest = history.iloc[-1]
        prev = history.iloc[-2]
        prev_close = float(prev["Close"])
        last_price = float(latest["Close"])

        # Adiciona verificação para NaN ou valores inválidos
        if prev_close == 0 or last_price == 0 or \
           (isinstance(prev_close, float) and (prev_close != prev_close)) or \
           (isinstance(last_price, float) and (last_price != last_price)):
            return None

        change_pct = ((last_price - prev_close) / prev_close) * 100
        return {
            "price": round(last_price, 6),
            "change_pct": round(change_pct, 4),
        }
    except Exception:
        # Captura qualquer erro durante a busca ou cálculo e retorna None
        return None

def parse_sina_iron_ore():
    url = "https://finance.sina.com.cn/futures/quotes/I0.shtml"
    response = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    response.raise_for_status()
    text = response.text

    match = re.search(r"\|\s*([0-9.]+)\s+([+-]?[0-9.]+)\s+([+-]?[0-9.]+)%\s+20", text)
    if not match:
        soup = BeautifulSoup(text, "html.parser")
        page_text = soup.get_text(" ", strip=True)
        match = re.search(r"|$I0$|.*?([0-9.]+)\s+([+-]?[0-9.]+)\s+([+-]?[0-9.]+)%", page_text)
    if not match:
        return None

    price = float(match.group(1))
    change_pct = float(match.group(3))
    return {
        "price": round(price, 6),
        "change_pct": round(change_pct, 4),
        "source": "sina",
        "auto": True,
    }

def china_composite():
    values = []
    for ticker in CHINA_BASKET:
        item = quote_from_history(ticker)
        if item and item.get("change_pct") is not None:
            values.append(item["change_pct"])
    if not values:
        return None
    return {
        "price": None,
        "change_pct": round(sum(values) / len(values), 4),
    }

def parse_b3_volume_d1():
    # Exemplo: Tentar raspar de um site de notícias financeiras que reporte o volume diário da B3
    # Esta URL é um exemplo e pode não funcionar ou exigir ajustes nos seletores.
    # Você precisaria encontrar uma fonte confiável e estável.
    url = "https://www.infomoney.com.br/mercados/b3/" # Exemplo de URL
    try:
        response = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "lxml")

        # Exemplo de como você procuraria por um elemento que contenha o volume
        # Isso é altamente dependente da estrutura HTML do site e pode quebrar.
        # Você precisaria inspecionar a página para encontrar o seletor correto.
        # Por exemplo, procurando por um texto como "Volume financeiro" e o valor associado.
        # Este é um placeholder e precisa ser ajustado para a estrutura real do site.
        volume_element = soup.find(text=re.compile(r"Volume financeiro"))
        if volume_element:
            # Tentar extrair o número do volume
            # Isso é um placeholder e precisa ser ajustado para a estrutura real.
            # Exemplo: se o volume estiver em um span adjacente
            volume_text_raw = volume_element.find_next("span").get_text(strip=True)
            # Limpa o texto para extrair apenas números e vírgulas/pontos
            volume_value = float(re.sub(r'[^\d,]+', '', volume_text_raw).replace(',', '.'))

            return {
                "price": round(volume_value, 2),
                "change_pct": None, # Não temos D-2 para calcular a variação percentual
                "source": "infomoney-b3",
                "auto": True,
            }
    except Exception:
        pass # Falha silenciosamente se o scraping não funcionar
    return None

def fetch_all():
    payload = {
        "meta": {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "source": "github-actions/yfinance+sina",
            "pipeline_status": "Atualização automática ativa",
            "note": "Investing privado usa tickers públicos. Minério Sina é raspado. B3 volume D-1 tenta scraping (sujeito a quebras). FGP e DJSH são fallbacks sem fonte automática estável. CHINA50 usa proxy Shanghai Composite.",
        },
        "assets": {},
    }

    for code, config in ASSETS.items():
        try:
            item = quote_from_history(config["ticker"])
            if not item:
                continue
            if config.get("invert"):
                item["change_pct"] = round(item["change_pct"] * -1, 4)
            item["source"] = config["source"]
            item["auto"] = True
            payload["assets"][code] = item
        except Exception:
            continue

    try:
        iron = parse_sina_iron_ore()
        if iron:
            payload["assets"]["MINERIO_SINA"] = iron
    except Exception:
        pass

    try:
        china = china_composite()
        if china:
            china["source"] = "china-basket"
            china["auto"] = True
            payload["assets"]["CHINA"] = china
    except Exception:
        pass

    # Tenta obter o volume D-1 da B3
    try:
        b3_volume = parse_b3_volume_d1()
        if b3_volume:
            payload["assets"]["VOL_D1"] = b3_volume
        else:
            # Se o scraping falhar, mantém o fallback
            payload["assets"].setdefault("VOL_D1", {"price": None, "change_pct": None, "source": "b3-fallback", "auto": False})
    except Exception:
        payload["assets"].setdefault("VOL_D1", {"price": None, "change_pct": None, "source": "b3-fallback", "auto": False})


    # FGP e outros fallbacks
    payload["assets"].setdefault("FGP", {"price": None, "change_pct": None, "source": "b3-fallback", "auto": False})
    payload["assets"].setdefault(".DJSH", {"price": None, "change_pct": None, "source": "proxy-fallback", "auto": False})
    # CHINA50 será preenchido se o ticker 000001.SS funcionar, caso contrário, será fallback.
    payload["assets"].setdefault("CHINA50", {"price": None, "change_pct": None, "source": "proxy-fallback", "auto": False})

    return payload

def main():
    payload = fetch_all()
    with open("data/quotes.json", "w", encoding="utf-8") as file_obj:
        json.dump(payload, file_obj, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
