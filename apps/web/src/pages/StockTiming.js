import { card, alertBox, escapeHtml } from "../ui/components.js";
import { getStockTiming, searchTicker } from "../api.js";

function windowRow(key, w, isBest, isWorst) {
  const sign = w.avgReturnPct > 0 ? "+" : "";
  const color = w.avgReturnPct > 0 ? "text-emerald-600" : w.avgReturnPct < 0 ? "text-rose-600" : "text-slate-600";
  return `
    <tr class="border-b">
      <td class="py-2 text-sm">${escapeHtml(w.label)} ${isBest ? "🏆" : ""} ${isWorst ? "📉" : ""}</td>
      <td class="py-2 text-sm text-right">${w.sampleDays}</td>
      <td class="py-2 text-sm text-right">${w.winRate}%</td>
      <td class="py-2 text-sm text-right font-semibold ${color}">${sign}${w.avgReturnPct}%</td>
    </tr>`;
}

function searchModal() {
  return `
    <div id="tickerSearchOverlay" class="hidden fixed inset-0 bg-black/40 z-50 flex items-start md:items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mt-16 md:mt-0 max-h-[80vh] flex flex-col">
        <div class="p-4 border-b flex items-center justify-between">
          <div class="font-semibold">종목 검색</div>
          <button id="tickerSearchClose" class="w-8 h-8 rounded-lg border bg-white">✕</button>
        </div>
        <div class="p-4 border-b">
          <input id="tickerSearchInput" type="text" autocomplete="off"
            class="w-full px-3 py-2 rounded-xl border bg-white"
            placeholder="회사명 또는 티커 입력 (예: 삼성전자, 카카오, Tesla, AAPL)" />
          <div class="text-[11px] text-slate-400 mt-1">국내 주요 종목은 한글 회사명으로도 검색할 수 있습니다.</div>
        </div>
        <div id="tickerSearchResults" class="overflow-auto p-2 flex-1 text-sm text-slate-500">
          검색어를 입력하세요.
        </div>
      </div>
    </div>
  `;
}

export function StockTimingPage(state) {
  const f = state.stockTimingForm || { symbol: "AAPL", period: "1y" };
  state.stockTimingForm = f;

  return `
    <div class="space-y-4">
      ${card("시간대별 주가흐름 분석 (yfinance)", `
        <form id="stockTimingForm" class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-600">티커 심볼</label>
            <div class="flex gap-2">
              <input name="symbol" id="stockTimingSymbol" class="w-full px-3 py-2 rounded-xl border bg-white" value="${escapeHtml(f.symbol)}" placeholder="AAPL, 005930.KS" required />
              <button type="button" id="tickerSearchOpen" class="shrink-0 px-3 py-2 rounded-xl border bg-white whitespace-nowrap">🔍 종목 검색</button>
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-600">분석 기간</label>
            <select name="period" class="w-full px-3 py-2 rounded-xl border bg-white">
              <option value="3mo" ${f.period === "3mo" ? "selected" : ""}>최근 3개월</option>
              <option value="6mo" ${f.period === "6mo" ? "selected" : ""}>최근 6개월</option>
              <option value="1y" ${f.period === "1y" ? "selected" : ""}>최근 1년</option>
              <option value="2y" ${f.period === "2y" ? "selected" : ""}>최근 2년</option>
            </select>
          </div>
          <div class="flex items-end">
            <button type="submit" class="btn-primary w-full">분석하기</button>
          </div>
        </form>
        <div class="mt-3 text-xs text-slate-500">
          장초반(당일 첫 시간봉) · 점심시간(당일 중간 시간봉) · 마감(당일 마지막 시간봉) 구간의 일별 수익률을 비교합니다.
          Yahoo Finance 1시간봉 데이터 기준이며, 거래소별 시간봉 그리드 차이로 인한 근사 계산입니다.
        </div>
      `)}
      <div id="stockTimingResult"></div>
      ${searchModal()}
    </div>
  `;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function mountTickerSearch(symbolInput) {
  const overlay = document.getElementById("tickerSearchOverlay");
  const openBtn = document.getElementById("tickerSearchOpen");
  const closeBtn = document.getElementById("tickerSearchClose");
  const searchInput = document.getElementById("tickerSearchInput");
  const resultsEl = document.getElementById("tickerSearchResults");
  if (!overlay || !openBtn) return;

  const open = () => {
    overlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    searchInput.value = "";
    resultsEl.innerHTML = `<div class="p-3 text-sm text-slate-500">검색어를 입력하세요.</div>`;
    setTimeout(() => searchInput.focus(), 0);
  };
  const close = () => {
    overlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  };

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) close();
  });

  const runSearch = debounce(async (q) => {
    if (!q.trim()) {
      resultsEl.innerHTML = `<div class="p-3 text-sm text-slate-500">검색어를 입력하세요.</div>`;
      return;
    }
    resultsEl.innerHTML = `<div class="p-3 text-sm text-slate-500">검색 중...</div>`;
    try {
      const { result } = await searchTicker(q.trim());
      if (!result.results.length) {
        resultsEl.innerHTML = `<div class="p-3 text-sm text-slate-500">검색 결과가 없습니다.</div>`;
        return;
      }
      resultsEl.innerHTML = result.results.map((r) => `
        <button type="button" data-symbol="${escapeHtml(r.symbol)}"
          class="ticker-result-item w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
          <span>
            <span class="font-medium">${escapeHtml(r.name)}</span>
            <span class="text-xs text-slate-400 ml-1">${escapeHtml(r.exchange || "")}</span>
          </span>
          <span class="text-xs text-slate-500 font-mono">${escapeHtml(r.symbol)}</span>
        </button>
      `).join("");

      resultsEl.querySelectorAll(".ticker-result-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          symbolInput.value = btn.dataset.symbol;
          close();
        });
      });
    } catch (err) {
      resultsEl.innerHTML = alertBox("error", `검색 오류: ${err.message}`);
    }
  }, 350);

  searchInput?.addEventListener("input", (e) => runSearch(e.target.value));
}

export function StockTimingMount(state) {
  const form = document.getElementById("stockTimingForm");
  const resultEl = document.getElementById("stockTimingResult");
  const symbolInput = document.getElementById("stockTimingSymbol");

  mountTickerSearch(symbolInput);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const symbol = String(fd.get("symbol") || "").trim().toUpperCase();
    const period = String(fd.get("period") || "1y");
    state.stockTimingForm = { symbol, period };

    if (resultEl) resultEl.innerHTML = alertBox("info", "yfinance에서 데이터를 가져와 분석 중... (몇 초 소요될 수 있습니다)");
    try {
      const { result } = await getStockTiming({ symbol, period, interval: "1h" });
      const w = result.windows;
      if (resultEl) {
        resultEl.innerHTML = `
          <div class="space-y-4">
            ${card(`${escapeHtml(result.symbol)} 분석 결과`, `
              <div class="text-sm text-slate-700 mb-3">
                분석 기간: ${escapeHtml(result.dataRange.from)} ~ ${escapeHtml(result.dataRange.to)} (${result.tradingDaysAnalyzed}거래일)
              </div>
              <div class="overflow-auto">
                <table class="w-full text-left">
                  <thead class="text-xs text-slate-500">
                    <tr class="border-b">
                      <th class="py-2">시간대</th>
                      <th class="py-2 text-right">표본일수</th>
                      <th class="py-2 text-right">상승확률</th>
                      <th class="py-2 text-right">평균수익률</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(w).map(([key, win]) => windowRow(key, win, key === result.bestWindow, key === result.worstWindow)).join("")}
                  </tbody>
                </table>
              </div>
              ${result.bestWindow ? `<div class="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">🏆 가장 상승 빈도가 높은 시간대: <b>${escapeHtml(w[result.bestWindow].label)}</b> (평균 ${w[result.bestWindow].avgReturnPct > 0 ? "+" : ""}${w[result.bestWindow].avgReturnPct}%, 상승확률 ${w[result.bestWindow].winRate}%)</div>` : ""}
              <div class="mt-3 text-[11px] text-slate-400">${escapeHtml(result.note)}</div>
            `)}
            ${alertBox("warn", "본 분석은 과거 데이터 기반 참고용이며, 향후 수익률을 보장하지 않습니다.")}
          </div>
        `;
      }
    } catch (err) {
      if (resultEl) resultEl.innerHTML = alertBox("error", `오류: ${err.message}`);
    }
  });
}
