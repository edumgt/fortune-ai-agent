import { card, pill, alertBox, escapeHtml } from "../ui/components.js";

function renderPillars(saju) {
  const p = saju.pillars;
  const row = (k, v) => `
    <div class="flex items-center justify-between p-3 rounded-xl border bg-slate-50">
      <div class="text-sm font-medium">${k}</div>
      <div class="text-lg font-semibold tracking-wide">${escapeHtml(v)}</div>
    </div>`;
  return `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      ${row("년주", p.year.text)}
      ${row("월주", p.month.text)}
      ${row("일주", p.day.text)}
      ${row("시주", p.hour.text)}
    </div>`;
}

function renderElements(elements) {
  const items = Object.entries(elements.counts)
    .map(([k,v]) => `<div class="flex items-center justify-between p-2 rounded-xl border bg-white">
        <div class="text-sm">${k}</div><div class="font-semibold">${v}</div>
      </div>`).join("");
  return `
    <div class="space-y-2">
      <div class="text-sm text-slate-600">강: <b>${elements.dominant.element}</b> / 약: <b>${elements.weak.element}</b></div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2">${items}</div>
    </div>`;
}

function renderDaeunMini(daeun) {
  if (!daeun?.periods?.length) return alertBox("warn", daeun?.warning || "대운 데이터가 없습니다.");
  const top = daeun.periods.slice(0, 5).map(p => `
    <div class="p-3 rounded-xl border bg-white">
      <div class="text-xs text-slate-500">대운 ${p.index}</div>
      <div class="text-lg font-semibold">${escapeHtml(p.pillar)}</div>
      <div class="text-xs text-slate-500 mt-1">${p.fromAge != null ? `${p.fromAge.toFixed(1)} ~ ${p.toAge.toFixed(1)}세` : "—"}</div>
    </div>
  `).join("");
  return `<div class="grid grid-cols-1 md:grid-cols-5 gap-2">${top}</div>`;
}

export function SajuResultPage(state) {
  const r = state.lastResult;
  if (!r) {
    return card("사주 결과", alertBox("warn", "계산 결과가 없습니다. 홈에서 먼저 계산하세요.") + `<div class="mt-3"><a class="underline" href="#/">홈으로</a></div>`);
  }

  const tags = (r.reading?.tags || []).map(pill).join(" ");
  const reading = r.reading?.text ? `<pre class="whitespace-pre-wrap text-sm leading-6 text-slate-800">${escapeHtml(r.reading.text)}</pre>` : "";

  return `
    <div class="space-y-4">
      ${card("사주팔자", renderPillars(r.saju), `
        <div class="flex flex-wrap gap-2">${tags}</div>
      `)}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${card("오행", renderElements(r.elements))}
        ${card("요약 풀이", reading || alertBox("info", "풀이 텍스트가 없습니다."))}
      </div>

      ${card("대운(미리보기)", renderDaeunMini(r.daeun), `
        <a href="#/daeun" class="inline-flex btn-primary">대운 자세히</a>
      `)}
    </div>
  `;
}

export function SajuResultMount() {}
