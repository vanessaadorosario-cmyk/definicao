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
}

CHINA_BASKET = ["000001.SS", "399001.SZ", "^HSI"]


def quote_from_history(ticker):
    history = yf.Ticker(ticker).history(period="5d", interval="1d", auto_adjust=False)
    if history.empty or len(history.index) < 2:
        return None
    latest = history.iloc[-1]
    prev = history.iloc[-2]
    prev_close = float(prev["Close"])
    last_price = float(latest["Close"])
    if prev_close == 0:
        return None
    change_pct = ((last_price - prev_close) / prev_close) * 100
    return {
        "price": round(last_price, 6),
        "change_pct": round(change_pct, 4),
    }


def parse_sina_iron_ore():
    url = "https://finance.sina.com.cn/futures/quotes/I0.shtml"
    response = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    response.raise_for_status()
    text = response.text

    match = re.search(r"\|\s*([0-9.]+)\s+([+-]?[0-9.]+)\s+([+-]?[0-9.]+)%\s+20", text)
    if not match:
        soup = BeautifulSoup(text, "html.parser")
        page_text = soup.get_text(" ", strip=True)
        match = re.search(r"\(I0\).*?([0-9.]+)\s+([+-]?[0-9.]+)\s+([+-]?[0-9.]+)%", page_text)
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


def fetch_all():
    payload = {
        "meta": {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "source": "github-actions/yfinance+sina",
            "pipeline_status": "Atualização automática ativa",
            "note": "Investing privado e B3 boletim exigem equivalência pública ou fallback até parser dedicado ser refinado.",
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

    payload["assets"].setdefault("FGP", {"price": None, "change_pct": None, "source": "b3-fallback", "auto": False})
    payload["assets"].setdefault("VOL_D1", {"price": None, "change_pct": None, "source": "b3-fallback", "auto": False})
    payload["assets"].setdefault(".DJSH", {"price": None, "change_pct": None, "source": "proxy-fallback", "auto": False})
    payload["assets"].setdefault("CHINA50", {"price": None, "change_pct": None, "source": "proxy-fallback", "auto": False})

    return payload


def main():
    payload = fetch_all()
    with open("data/quotes.json", "w", encoding="utf-8") as file_obj:
        json.dump(payload, file_obj, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
