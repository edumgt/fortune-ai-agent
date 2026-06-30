import { card, alertBox, escapeHtml } from "../ui/components.js";
import { getLotto } from "../api.js";

function ballColor(n) {
  if (n <= 10) return "bg-amber-400";
  if (n <= 20) return "bg-sky-500";
  if (n <= 30) return "bg-rose-500";
  if (n <= 40) return "bg-slate-500";
  return "bg-emerald-500";
}

function renderBalls(numbers) {
  return numbers
    .map((n) => `<span class="inline-flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold ${ballColor(n)}">${n}</span>`)
    .join("");
}

export function LottoPage(state) {
  const f = state.lottoForm || { year: "", month: "", day: "", count: 5 };
  state.lottoForm = f;

  return `
    <div class="space-y-4">
      ${card("로또번호 추천", `
        <form id="lottoForm" class="space-y-3">
          <div class="text-xs text-slate-500">생년월일을 입력하면 오늘 하루 고정되는 '오늘의 행운번호'가 함께 추천됩니다(선택 입력).</div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="text-xs text-slate-600">생년</label>
              <input name="year" type="number" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.year}" placeholder="1990" />
            </div>
            <div>
              <label class="text-xs text-slate-600">월</label>
              <input name="month" type="number" min="1" max="12" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.month}" placeholder="1" />
            </div>
            <div>
              <label class="text-xs text-slate-600">일</label>
              <input name="day" type="number" min="1" max="31" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.day}" placeholder="1" />
            </div>
            <div>
              <label class="text-xs text-slate-600">생성 개수</label>
              <input name="count" type="number" min="1" max="5" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.count}" />
            </div>
          </div>
          <button type="submit" class="btn-primary">추천번호 받기</button>
        </form>
      `)}
      <div id="lottoResult"></div>
    </div>
  `;
}

export function LottoMount(state) {
  const form = document.getElementById("lottoForm");
  const resultEl = document.getElementById("lottoResult");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const year = fd.get("year") ? Number(fd.get("year")) : null;
    const month = fd.get("month") ? Number(fd.get("month")) : null;
    const day = fd.get("day") ? Number(fd.get("day")) : null;
    const count = Number(fd.get("count")) || 5;
    state.lottoForm = { year: year || "", month: month || "", day: day || "", count };

    if (resultEl) resultEl.innerHTML = alertBox("info", "번호 생성 중...");
    try {
      const body = { count };
      if (year && month && day) body.birthDate = { year, month, day };
      const { result } = await getLotto(body);
      if (resultEl) {
        resultEl.innerHTML = card("추천 결과", `
          <div class="space-y-3">
            ${result.games.map((g) => `
              <div class="flex items-center gap-3 flex-wrap">
                <span class="text-xs text-slate-500 w-28 shrink-0">${escapeHtml(g.label)}</span>
                <div class="flex gap-2 flex-wrap">${renderBalls(g.numbers)}</div>
              </div>
            `).join("")}
            <div class="text-[11px] text-slate-400 pt-2 border-t">참고용 데모입니다. 실제 당첨을 보장하지 않습니다.</div>
          </div>
        `);
      }
    } catch (err) {
      if (resultEl) resultEl.innerHTML = alertBox("error", `오류: ${err.message}`);
    }
  });
}
