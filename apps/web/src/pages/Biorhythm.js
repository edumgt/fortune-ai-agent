import { card, alertBox, escapeHtml } from "../ui/components.js";
import { calcBiorhythm } from "../api.js";

function defaultForm() {
  return { year: 1990, month: 1, day: 1 };
}

function cycleBar(key, c) {
  const colors = { physical: "bg-rose-500", emotional: "bg-sky-500", intellectual: "bg-emerald-500" };
  const pct = Math.round((c.value + 100) / 2); // -100..100 -> 0..100
  return `
    <div>
      <div class="flex items-center justify-between text-sm mb-1">
        <span>${c.emoji} ${escapeHtml(c.ko)}</span>
        <span class="font-semibold">${c.value > 0 ? "+" : ""}${c.value}% · ${escapeHtml(c.levelKo)}</span>
      </div>
      <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div class="${colors[key]} h-full rounded-full" style="width:${pct}%"></div>
      </div>
      ${c.critical ? `<div class="text-[11px] text-amber-600 mt-1">⚠️ 임계일 — 컨디션 변화가 큰 날입니다.</div>` : ""}
    </div>`;
}

function chartSvg(series) {
  const w = 600, h = 160, padX = 10, padY = 10;
  const n = series.length;
  const x = (i) => padX + (i * (w - padX * 2)) / (n - 1);
  const y = (v) => padY + (h - padY * 2) * (1 - (v + 100) / 200);

  const line = (key, color) => {
    const pts = series.map((p, i) => `${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" />`;
  };

  const todayIdx = series.findIndex((p) => p.offset === 0);

  return `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-40">
      <line x1="${padX}" y1="${(h / 2).toFixed(1)}" x2="${w - padX}" y2="${(h / 2).toFixed(1)}" stroke="#e2e8f0" stroke-width="1" />
      ${todayIdx >= 0 ? `<line x1="${x(todayIdx).toFixed(1)}" y1="${padY}" x2="${x(todayIdx).toFixed(1)}" y2="${h - padY}" stroke="#cbd5e1" stroke-dasharray="3,3" />` : ""}
      ${line("physical", "#f43f5e")}
      ${line("emotional", "#0ea5e9")}
      ${line("intellectual", "#10b981")}
    </svg>`;
}

export function BiorhythmPage(state) {
  const f = state.biorhythmForm || defaultForm();
  state.biorhythmForm = f;

  const formCard = card(
    "바이오리듬 계산",
    `
    <form id="biorhythmForm" class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label class="text-xs text-slate-600">생년</label>
        <input name="year" type="number" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.year}" required />
      </div>
      <div>
        <label class="text-xs text-slate-600">월</label>
        <input name="month" type="number" min="1" max="12" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.month}" required />
      </div>
      <div>
        <label class="text-xs text-slate-600">일</label>
        <input name="day" type="number" min="1" max="31" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.day}" required />
      </div>
      <div class="md:col-span-3">
        <button type="submit" class="btn-primary">바이오리듬 계산</button>
      </div>
    </form>
    `
  );

  return `
    <div class="space-y-4">
      ${formCard}
      <div id="biorhythmResult"></div>
    </div>
  `;
}

async function runCalc(state) {
  const resultEl = document.getElementById("biorhythmResult");
  if (!resultEl) return;
  const f = state.biorhythmForm;
  resultEl.innerHTML = alertBox("info", "계산 중...");
  try {
    const { result } = await calcBiorhythm({ birthDate: f });
    const c = result.cycles;
    resultEl.innerHTML = `
      <div class="space-y-4">
        ${card(`오늘(${escapeHtml(result.targetDate)}) 바이오리듬`, `
          <div class="space-y-4">
            ${cycleBar("physical", c.physical)}
            ${cycleBar("emotional", c.emotional)}
            ${cycleBar("intellectual", c.intellectual)}
            <div class="text-sm text-slate-600">평균 지수: <b>${result.average > 0 ? "+" : ""}${result.average}%</b> (출생 후 ${result.daysSinceBirth.toLocaleString()}일째)</div>
          </div>
        `)}
        ${card("최근/향후 14일 추이", `
          ${chartSvg(result.series)}
          <div class="flex gap-4 text-xs mt-2">
            <span class="flex items-center gap-1"><span class="w-3 h-0.5 bg-rose-500 inline-block"></span>신체</span>
            <span class="flex items-center gap-1"><span class="w-3 h-0.5 bg-sky-500 inline-block"></span>감정</span>
            <span class="flex items-center gap-1"><span class="w-3 h-0.5 bg-emerald-500 inline-block"></span>지성</span>
          </div>
        `)}
      </div>
    `;
  } catch (err) {
    resultEl.innerHTML = alertBox("error", `오류: ${err.message || err}`);
  }
}

export function BiorhythmMount(state) {
  const form = document.getElementById("biorhythmForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    state.biorhythmForm = {
      year: Number(fd.get("year")),
      month: Number(fd.get("month")),
      day: Number(fd.get("day")),
    };
    runCalc(state);
  });
  runCalc(state);
}
