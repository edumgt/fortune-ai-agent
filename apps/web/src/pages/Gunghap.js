import { card, alertBox, escapeHtml } from "../ui/components.js";
import { calcGunghap } from "../api.js";

function personForm(prefix) {
  return `
  <div class="p-4 rounded-2xl border bg-white">
    <div class="font-semibold">${prefix === "a" ? "A" : "B"} 정보</div>
    <div class="grid grid-cols-2 gap-2 mt-3">
      <div>
        <label class="text-xs text-slate-600">생년</label>
        <input name="${prefix}_year" type="number" class="w-full px-3 py-2 rounded-xl border bg-white" value="1990" required />
      </div>
      <div>
        <label class="text-xs text-slate-600">성별</label>
        <select name="${prefix}_gender" class="w-full px-3 py-2 rounded-xl border bg-white">
          <option value="M">남</option>
          <option value="F">여</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-slate-600">월</label>
        <input name="${prefix}_month" type="number" min="1" max="12" class="w-full px-3 py-2 rounded-xl border bg-white" value="1" required />
      </div>
      <div>
        <label class="text-xs text-slate-600">일</label>
        <input name="${prefix}_day" type="number" min="1" max="31" class="w-full px-3 py-2 rounded-xl border bg-white" value="1" required />
      </div>
      <div>
        <label class="text-xs text-slate-600">시</label>
        <input name="${prefix}_hour" type="number" min="0" max="23" class="w-full px-3 py-2 rounded-xl border bg-white" value="9" required />
      </div>
      <div>
        <label class="text-xs text-slate-600">분</label>
        <input name="${prefix}_minute" type="number" min="0" max="59" class="w-full px-3 py-2 rounded-xl border bg-white" value="0" required />
      </div>
    </div>
  </div>`;
}

function readPerson(fd, prefix) {
  return {
    year: Number(fd.get(`${prefix}_year`)),
    month: Number(fd.get(`${prefix}_month`)),
    day: Number(fd.get(`${prefix}_day`)),
    hour: Number(fd.get(`${prefix}_hour`)),
    minute: Number(fd.get(`${prefix}_minute`)),
    gender: String(fd.get(`${prefix}_gender`)),
    longitude: 127,
    applyTimeCorrection: true,
  };
}

function renderPillars(r) {
  const p = r.saju.pillars;
  return `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div class="p-2 rounded-xl border bg-slate-50"><div class="text-[11px] text-slate-500">년</div><div class="font-semibold">${escapeHtml(p.year.text)}</div></div>
      <div class="p-2 rounded-xl border bg-slate-50"><div class="text-[11px] text-slate-500">월</div><div class="font-semibold">${escapeHtml(p.month.text)}</div></div>
      <div class="p-2 rounded-xl border bg-slate-50"><div class="text-[11px] text-slate-500">일</div><div class="font-semibold">${escapeHtml(p.day.text)}</div></div>
      <div class="p-2 rounded-xl border bg-slate-50"><div class="text-[11px] text-slate-500">시</div><div class="font-semibold">${escapeHtml(p.hour.text)}</div></div>
    </div>
  `;
}

function renderRelations(rel) {
  const fmt = (arr) => (arr?.length ? arr.map(p => `${p[0]}-${p[1]}`).join(", ") : "없음");
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      <div class="p-3 rounded-xl border bg-white"><b>합</b>: ${escapeHtml(fmt(rel.hap))}</div>
      <div class="p-3 rounded-xl border bg-white"><b>충</b>: ${escapeHtml(fmt(rel.chung))}</div>
      <div class="p-3 rounded-xl border bg-white"><b>해</b>: ${escapeHtml(fmt(rel.hae))}</div>
      <div class="p-3 rounded-xl border bg-white"><b>파</b>: ${escapeHtml(fmt(rel.pa))}</div>
    </div>
  `;
}

export function GunghapPage() {
  return `
    <div class="space-y-4">
      ${card("궁합", `
        <form id="gunghapForm" class="space-y-3">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            ${personForm("a")}
            ${personForm("b")}
          </div>
          <button type="submit" class="btn-primary">궁합 계산</button>
        </form>
        <div id="gunghapMsg" class="mt-4"></div>
        <div id="gunghapOut" class="mt-4"></div>
      `)}
    </div>
  `;
}

export function GunghapMount() {
  const form = document.getElementById("gunghapForm");
  const msg = document.getElementById("gunghapMsg");
  const out = document.getElementById("gunghapOut");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.innerHTML = alertBox("info", "계산 중...");
    if (out) out.innerHTML = "";

    const fd = new FormData(form);
    const a = readPerson(fd, "a");
    const b = readPerson(fd, "b");

    try {
      const data = await calcGunghap(a, b);
      const { gunghap } = data;

      if (msg) msg.innerHTML = alertBox("ok", gunghap.summary);

      out.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${card("A 사주", renderPillars(data.a))}
          ${card("B 사주", renderPillars(data.b))}
        </div>

        <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${card("궁합 점수", `
            <div class="text-4xl font-bold">${gunghap.score}</div>
            <div class="text-sm text-slate-600 mt-2">${escapeHtml(gunghap.summary)}</div>
          `)}
          ${card("관계(합/충/해/파)", renderRelations(gunghap.relations))}
        </div>

        <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${card("A 풀이 요약", `<pre class="whitespace-pre-wrap text-sm leading-6">${escapeHtml(data.a.reading?.text || "")}</pre>`)}
          ${card("B 풀이 요약", `<pre class="whitespace-pre-wrap text-sm leading-6">${escapeHtml(data.b.reading?.text || "")}</pre>`)}
        </div>
      `;
    } catch (err) {
      if (msg) msg.innerHTML = alertBox("error", `오류: ${err.message || err}`);
    }
  });
}
