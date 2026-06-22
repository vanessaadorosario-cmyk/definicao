const AUTO_DATA_URL = "data/quotes.json";
const REFRESH_MS = 300000;
const HISTORY_LIMIT = 48;
const historyState = [];

const assets = [
  { code: "HG", name: "Cobre Futuros", group: "risk", source: "yfinance", ticker: "HG=F", weight: 1.1, threshold: 0.15 },
  { code: "CL", name: "Petróleo WTI Futuros", group: "risk", source: "yfinance", ticker: "CL=F", weight: 1.15, threshold: 0.15 },
  { code: ".OSEAX", name: "Oslo All Share", group: "risk", source: "yfinance", ticker: "OSEAX.OL", weight: 0.95, threshold: 0.2 },
  { code: "ZS", name: "Soja Chicago Futuros", group: "risk", source: "yfinance", ticker: "ZS=F", weight: 0.8, threshold: 0.15 },
  { code: "YMH26", name: "Dow Jones Futuros", group: "risk", source: "yfinance", ticker: "YM=F", weight: 1.2, threshold: 0.15 },
  { code: ".GDOW", name: "The Global Dow USD", group: "risk", source: "proxy", ticker: "^GDOW", weight: 0.7, threshold: 0.15 },
  { code: "MINERIO_SINA", name: "Minério de Ferro", group: "risk", source: "sina", ticker: "I0", weight: 1.8, threshold: 3 },
  { code: "VALE.K", name: "Vale SA ADR", group: "risk", source: "yfinance", ticker: "VALE", weight: 1.2, threshold: 0.15 },
  { code: "PBR", name: "Petrobras SA ADR", group: "risk", source: "yfinance", ticker: "PBR", weight: 1.1, threshold: 0.15 },
  { code: "EWZ", name: "iShares MSCI Brazil ETF", group: "risk", source: "yfinance", ticker: "EWZ", weight: 1.25, threshold: 0.15 },
  { code: "XLF", name: "The Financial Select Sector SPDR Fund", group: "risk", source: "yfinance", ticker: "XLF", weight: 0.95, threshold: 0.15 },
  { code: "XLP", name: "The Consumer Staples Select Sector SPDR Fund", group: "risk", source: "yfinance", ticker: "XLP", weight: 0.7, threshold: 0.15 },
  { code: "XLE", name: "The Energy Select Sector SPDR Fund", group: "risk", source: "yfinance", ticker: "XLE", weight: 0.9, threshold: 0.15 },
  { code: "XME", name: "SPDR S&P Metals and Mining ETF", group: "risk", source: "yfinance", ticker: "XME", weight: 0.95, threshold: 0.15 },
  { code: "EEM", name: "iShares MSCI Emerging Markets ETF", group: "risk", source: "yfinance", ticker: "EEM", weight: 0.9, threshold: 0.15 },
  { code: "SOXX.O", name: "iShares Semiconductor ETF", group: "risk", source: "yfinance", ticker: "SOXX", weight: 1.1, threshold: 0.15 },
  { code: ".BSESN", name: "BSE Sensex 30", group: "risk", source: "yfinance", ticker: "^BSESN", weight: 0.85, threshold: 0.2 },
  { code: "CHINA", name: "Bolsas China", group: "risk", source: "composite", ticker: "CHINA_BASKET", weight: 1, threshold: 0.2 },
  { code: "VLO", name: "Valero Energy Corporation", group: "risk", source: "yfinance", ticker: "VLO", weight: 0.65, threshold: 0.15 },
  { code: "DX", name: "Índice Dólar Futuros", group: "security", source: "yfinance", ticker: "DX-Y.NYB", weight: 1.35, threshold: 0.1 },
  { code: "VX", name: "S&P 500 VIX Futuros", group: "security", source: "yfinance", ticker: "^VIX", weight: 1.4, threshold: 0.5 },
  { code: "USD/MXN", name: "USD/MXN", group: "security", source: "yfinance", ticker: "USDMXN=X", weight: 1.1, threshold: 0.12 },
  { code: "USD/NOK", name: "USD/NOK", group: "security", source: "yfinance", ticker: "USDNOK=X", weight: 0.95, threshold: 0.12 },
  { code: "USD/NZD", name: "USD/NZD", group: "security", source: "derived", ticker: "NZDUSD=X", weight: 0.9, threshold: 0.12, invert: true },
  { code: "USD/AUD", name: "USD/AUD", group: "security", source: "derived", ticker: "AUDUSD=X", weight: 0.9, threshold: 0.12, invert: true },
  { code: "USD/KRW", name: "USD/KRW", group: "security", source: "yfinance", ticker: "USDKRW=X", weight: 0.85, threshold: 0.12 },
  { code: "USD/CNY", name: "USD/CNY", group: "security", source: "yfinance", ticker: "USDCNY=X", weight: 1.2, threshold: 0.08 },
  { code: "EUR/BRL", name: "EUR/BRL", group: "security", source: "yfinance", ticker: "EURBRL=X", weight: 0.95, threshold: 0.12 },
  { code: "FGP", name: "Posição dos Estrangeiros 10k+", group: "security", source: "b3", ticker: "B3_FOREIGNERS", weight: 1.6, threshold: 1 },
  { code: "VOL_D1", name: "Volume D-1", group: "security", source: "b3", ticker: "B3_VOLUME_D1", weight: 0.8, threshold: 1 },
  { code: ".SZI", name: "SZSE Component", group: "neutral", source: "yfinance", ticker: "399001.SZ", weight: 0.65, threshold: 0.18 },
  { code: ".SSEC", name: "Shanghai Composite", group: "neutral", source: "yfinance", ticker: "000001.SS", weight: 0.65, threshold: 0.18 },
  { code: ".DJSH", name: "Dow Jones Shanghai", group: "neutral", source: "proxy", ticker: "DJSH_PROXY", weight: 0.6, threshold: 0.18 },
  { code: "CHINA50", name: "China A50 Futuros", group: "neutral", source: "proxy", ticker: "CN50_PROXY", weight: 0.75, threshold: 0.18 },
  { code: "HSIQF6", name: "Hang Seng Futuros", group: "neutral", source: "yfinance", ticker: "^HSI", weight: 0.85, threshold: 0.2 },
  { code: "GC", name: "Ouro Futuros", group: "neutral", source: "yfinance", ticker: "GC=F", weight: 0.7, threshold: 0.15 }
];

function fmtPct(value) {
  return value == null || Number.isNaN(value) ? "--" : `${value.toFixed(2)} %`;
}

function fmtNumber(value) {
  return value == null || Number.isNaN(value) ? "--" : value.toFixed(2);
}

function groupLabel(group) {
  if (group === "risk") return "Risco";
  if (group === "security") return "Segurança";
  return "Neutro";
}

function statusClass(kind) {
  if (kind === "up") return "status-up";
  if (kind === "down") return "status-down";
  return "status-neutral";
}

function classify(asset, changePct) {
  if (changePct == null || Number.isNaN(changePct)) {
    return { label: "Sem dado", side: "neutral", score: 0 };
  }

  const absThreshold = asset.threshold;
  if (Math.abs(changePct) < absThreshold) {
    return { label: "Neutro", side: "neutral", score: 0 };
  }

  if (asset.group === "risk") {
    if (changePct > 0) return { label: "Favorece índice", side: "red", score: asset.weight };
    return { label: "Favorece dólar", side: "green", score: asset.weight };
  }

  if (asset.group === "security") {
    if (changePct > 0) return { label: "Favorece dólar", side: "green", score: asset.weight };
    return { label: "Favorece índice", side: "red", score: asset.weight };
  }

  return { label: "Indeciso", side: "gray", score: Math.abs(changePct) >= absThreshold ? asset.weight : 0 };
}

function summarise(dataMap) {
  let green = 0;
  let red = 0;
  let gray = 0;
  let covered = 0;
  const decorated = assets.map((asset) => {
    const item = dataMap[asset.code] || {};
    const classification = classify(asset, item.change_pct);
    if (item.change_pct != null) covered += 1;
    if (classification.side === "green") green += classification.score;
    if (classification.side === "red") red += classification.score;
    if (asset.group === "neutral") {
      gray += classification.score || asset.weight * (item.change_pct == null ? 0 : Math.max(0, asset.threshold - Math.abs(item.change_pct)) / asset.threshold);
    }
    return { ...asset, ...item, classification };
  });

  const spread = green - red;
  const blue = historyState.length
    ? historyState[historyState.length - 1].blue * 0.55 + spread * 0.45
    : spread;

  return {
    decorated,
    covered,
    green,
    red,
    blue,
    gray,
    spread
  };
}

function describeState(summary) {
  const highGray = summary.gray > Math.max(summary.green, summary.red);
  const lowGray = summary.gray < Math.min(summary.green, summary.red) * 0.45;
  let bias = "neutral";
  let mainSignal = "Mercado lateral e sem dominância clara.";
  let blueSignal = "Linha azul sem tendência dominante.";
  let graySignal = "Linha cinza em equilíbrio com as demais.";
  let explainer = "As linhas ainda não apontam superioridade limpa entre risco e segurança.";

  if (summary.green > summary.red) {
    bias = "up";
    mainSignal = "Dólar com vantagem; segurança domina o fluxo.";
    blueSignal = summary.blue > 0 ? "Linha azul confirma continuação da compra de dólar." : "Linha azul já perdeu força; observar virada.";
    explainer = "Segurança subindo mais que risco. A leitura base é compra de dólar e venda de índice.";
  } else if (summary.red > summary.green) {
    bias = "down";
    mainSignal = "Índice com vantagem; risco domina o fluxo.";
    blueSignal = summary.blue < 0 ? "Linha azul confirma continuação da compra de índice." : "Linha azul perdeu intensidade; mercado pode estar virando.";
    explainer = "Risco subindo mais que segurança. A leitura base é compra de índice e venda de dólar.";
  }

  if (highGray) {
    graySignal = "Cinza acima de tudo: indecisão puxando compra de dólar e venda de índice.";
  } else if (lowGray) {
    graySignal = "Cinza comprimida: favorece compra de índice e venda de dólar.";
  } else {
    graySignal = "Cinza intermediária: indecisos ainda travam aceleração do fluxo.";
  }

  return { bias, mainSignal, blueSignal, graySignal, explainer };
}

function renderTable(rows) {
  const tbody = document.getElementById("assets-table");
  tbody.innerHTML = "";

  for (const row of rows) {
    const tr = document.createElement("tr");
    const groupClass = row.group === "risk" ? "group-risk" : row.group === "security" ? "group-security" : "group-neutral";
    const changeText = fmtPct(row.change_pct);
    const sourceStatus = row.auto ? "Automático" : "Fallback";
    tr.innerHTML = `
      <td>${row.name}</td>
      <td class="code">${row.code}</td>
      <td class="${groupClass}">${groupLabel(row.group)}</td>
      <td>${changeText}</td>
      <td>${fmtNumber(row.weight)}</td>
      <td><span class="small-badge ${statusClass(row.classification.side === "green" ? "up" : row.classification.side === "red" ? "down" : "neutral")}">${row.classification.label}</span></td>
      <td><span class="source-tag">${sourceStatus} · ${row.source}</span></td>
    `;
    tbody.appendChild(tr);
  }
}

function renderCoverage(rows, meta) {
  const list = document.getElementById("coverage-list");
  list.innerHTML = "";

  const items = [
    `Atualização principal: ${meta.source || "desconhecida"}.`,
    "Investing não é acessível automaticamente sem login; o painel usa tickers públicos equivalentes.",
    "Sina do minério é lida diretamente no pipeline quando disponível.",
    "B3 estrangeiros e volume D-1 exigem parser específico do boletim diário; se não vierem, ficam sinalizados como fallback.",
    `Cobertura automática atual: ${meta.covered}/${assets.length} ativos com variação válida.`
  ];

  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
}

function pushHistory(summary) {
  const point = {
    ts: Date.now(),
    green: summary.green,
    red: summary.red,
    blue: summary.blue,
    gray: summary.gray
  };
  historyState.push(point);
  while (historyState.length > HISTORY_LIMIT) historyState.shift();
  return point;
}

function renderChart() {
  const canvas = document.getElementById("market-chart");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(rect.width * dpr);
  const height = Math.floor(rect.height * dpr);
  canvas.width = width;
  canvas.height = height;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  if (!historyState.length) return;

  const padding = { top: 18, right: 16, bottom: 28, left: 34 };
  const plotWidth = rect.width - padding.left - padding.right;
  const plotHeight = rect.height - padding.top - padding.bottom;
  const values = historyState.flatMap((entry) => [entry.green, entry.red, entry.blue, entry.gray]);
  const maxValue = Math.max(3, ...values);
  const minValue = Math.min(-3, ...values);
  const range = maxValue - minValue || 1;
  const xAt = (index) => padding.left + (historyState.length === 1 ? plotWidth / 2 : (index / (historyState.length - 1)) * plotWidth);
  const yAt = (value) => padding.top + plotHeight - ((value - minValue) / range) * plotHeight;

  ctx.strokeStyle = "rgba(148, 169, 186, 0.16)";
  ctx.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const y = padding.top + (plotHeight / 4) * step;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + plotWidth, y);
    ctx.stroke();
  }

  const lines = [
    { key: "green", color: "#7ddf64", dash: [] },
    { key: "red", color: "#ff6b5b", dash: [] },
    { key: "blue", color: "#44c5f3", dash: [8, 6] },
    { key: "gray", color: "#c6ced6", dash: [3, 7] }
  ];

  lines.forEach((line) => {
    ctx.beginPath();
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(line.dash);
    historyState.forEach((entry, index) => {
      const x = xAt(index);
      const y = yAt(entry[line.key]);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function updateDom(meta, summary, interpretation) {
  document.getElementById("source-name").textContent = meta.source || "Pipeline";
  document.getElementById("updated-at").textContent = meta.updated_at ? new Date(meta.updated_at).toLocaleString("pt-BR") : "--";
  document.getElementById("coverage-rate").textContent = `${summary.covered}/${assets.length}`;
  document.getElementById("source-note").textContent = meta.note || "Painel usando dados automáticos e equivalências públicas quando a fonte original é fechada.";
  document.getElementById("line-green-value").textContent = fmtNumber(summary.green);
  document.getElementById("line-red-value").textContent = fmtNumber(summary.red);
  document.getElementById("line-blue-value").textContent = fmtNumber(summary.blue);
  document.getElementById("line-gray-value").textContent = fmtNumber(summary.gray);
  document.getElementById("line-green-text").textContent = summary.green >= summary.red ? "Segurança domina." : "Segurança perdeu força.";
  document.getElementById("line-red-text").textContent = summary.red >= summary.green ? "Risco domina." : "Risco perdeu força.";
  document.getElementById("line-blue-text").textContent = summary.blue > 0 ? "Tendência ainda pró dólar." : summary.blue < 0 ? "Tendência ainda pró índice." : "Sem persistência.";
  document.getElementById("line-gray-text").textContent = summary.gray > Math.max(summary.green, summary.red) ? "Indecisos pesam pró dólar." : summary.gray < Math.min(summary.green, summary.red) * 0.45 ? "Indecisos liberam índice." : "Indecisão intermediária.";
  document.getElementById("main-signal").textContent = interpretation.mainSignal;
  document.getElementById("blue-signal").textContent = interpretation.blueSignal;
  document.getElementById("gray-signal").textContent = interpretation.graySignal;
  document.getElementById("signal-explainer").textContent = interpretation.explainer;
  document.getElementById("main-bias-tag").className = `bias-tag bias-${interpretation.bias}`;
  document.getElementById("main-bias-tag").textContent = interpretation.bias === "up" ? "Compra dólar" : interpretation.bias === "down" ? "Compra índice" : "Neutro";
  document.getElementById("auto-status").textContent = meta.pipeline_status || "Modo automático";
  const turn = historyState.length > 1
    ? historyState[historyState.length - 1].blue > historyState[historyState.length - 2].blue
      ? "Linha azul acelerando"
      : "Linha azul desacelerando"
    : "Sem histórico";
  document.getElementById("market-turn").textContent = turn;
}

function transformPayload(payload) {
  const assetData = payload.assets || {};
  return assetData;
}

async function loadDashboard() {
  const response = await fetch(`${AUTO_DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  const meta = payload.meta || {};
  const dataMap = transformPayload(payload);
  const summary = summarise(dataMap);
  pushHistory(summary);
  const interpretation = describeState(summary);
  renderTable(summary.decorated);
  renderCoverage(summary.decorated, { ...meta, covered: summary.covered });
  updateDom(meta, summary, interpretation);
  renderChart();
}

async function refreshLoop() {
  try {
    await loadDashboard();
  } catch (error) {
    document.getElementById("source-note").textContent = `Falha ao carregar dados: ${error.message}`;
    document.getElementById("auto-status").textContent = "Falha no carregamento";
  }
}

window.addEventListener("resize", () => {
  if (historyState.length) renderChart();
});

document.addEventListener("DOMContentLoaded", () => {
  refreshLoop();
  window.setInterval(refreshLoop, REFRESH_MS);
});
