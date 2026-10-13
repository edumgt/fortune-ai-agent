import { calcZiwei } from "../api.js";
import { alertBox, card, escapeHtml } from "../ui/components.js";

const PALACE_LABELS = {
  명궁: "명궁", 형제: "형제궁", 부처: "부부궁", 자녀: "자녀궁",
  재백: "재백궁", 질액: "질액궁", 천이: "천이궁", 노복: "교우궁",
  관록: "관록궁", 전택: "전택궁", 복덕: "복덕궁", 부모: "부모궁",
};

// iztro 인덱스는 인궁(0)에서 시작한다. 전통적인 12궁 명반 배치.
const POSITIONS = [
  [1, 4], [1, 3], [1, 2], [1, 1],
  [2, 1], [3, 1], [4, 1], [4, 2],
  [4, 3], [4, 4], [3, 4], [2, 4],
];

function birthForm(state) {
  const f = state.ziweiForm || state.form || {};
  const number = (key, fallback) => Number.isInteger(f[key]) ? f[key] : fallback;
  const calendarType = f.calendarType === "lunar" ? "lunar" : "solar";
  return '<form id="ziweiForm" class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
    '<label class="text-sm">달력<select name="calendarType" class="mt-1 w-full px-3 py-2 rounded-xl border bg-white">' +
      '<option value="solar"' + (calendarType === "solar" ? ' selected' : '') + '>양력</option>' +
      '<option value="lunar"' + (calendarType === "lunar" ? ' selected' : '') + '>음력</option>' +
    '</select></label>' +
    '<label class="text-sm">성별<select name="gender" class="mt-1 w-full px-3 py-2 rounded-xl border bg-white">' +
      '<option value="M"' + (f.gender !== "F" ? ' selected' : '') + '>남</option>' +
      '<option value="F"' + (f.gender === "F" ? ' selected' : '') + '>여</option>' +
    '</select></label>' +
    '<label id="ziweiLeapLabel" class="text-sm flex items-end gap-2 pb-2 ' + (calendarType === "lunar" ? '' : 'hidden') + '">' +
      '<input type="checkbox" name="isLeapMonth" class="w-4 h-4" ' + (f.isLeapMonth ? 'checked' : '') + '>윤달' +
    '</label>' +
    '<label class="text-sm">생년<input name="year" type="number" min="1" max="9999" required value="' + number("year", 1990) + '" class="mt-1 w-full px-3 py-2 rounded-xl border bg-white"></label>' +
    '<label class="text-sm">월<input name="month" type="number" min="1" max="12" required value="' + number("month", 1) + '" class="mt-1 w-full px-3 py-2 rounded-xl border bg-white"></label>' +
    '<label class="text-sm">일<input name="day" type="number" min="1" max="31" required value="' + number("day", 1) + '" class="mt-1 w-full px-3 py-2 rounded-xl border bg-white"></label>' +
    '<label class="text-sm">시 (0~23)<input name="hour" type="number" min="0" max="23" required value="' + number("hour", 9) + '" class="mt-1 w-full px-3 py-2 rounded-xl border bg-white"></label>' +
    '<label class="text-sm">분<input name="minute" type="number" min="0" max="59" required value="' + number("minute", 0) + '" class="mt-1 w-full px-3 py-2 rounded-xl border bg-white"></label>' +
    '<div class="col-span-2 md:col-span-4 flex items-end"><button type="submit" class="btn-primary">명반 만들기</button></div>' +
    '</form><div id="ziweiMessage" class="mt-3" role="status" aria-live="polite"></div>';
}

function renderStar(star, isMajor = false) {
  const className = isMajor ? 'bg-blue-100 text-blue-900 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200';
  return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-xs ' + className + '">' +
    escapeHtml(star.name) +
    (star.mutagen ? '<b class="text-blue-700">化' + escapeHtml(star.mutagen) + '</b>' : '') +
  '</span>';
}

function renderPalace(palace) {
  const [column, row] = POSITIONS[palace.index];
  const majors = palace.majorStars.length
    ? palace.majorStars.map((star) => renderStar(star, true)).join('')
    : '<span class="text-xs text-slate-400">주성 없음</span>';
  const minors = palace.minorStars.map((star) => renderStar(star)).join('');
  const adjectives = palace.adjectiveStars.map((star) => escapeHtml(star.name)).join(' · ');
  return '<section style="grid-column:' + column + ';grid-row:' + row + '" class="min-h-40 p-2 rounded-xl border bg-white shadow-sm">' +
    '<div class="flex items-start justify-between gap-1 border-b pb-1 mb-1">' +
      '<div class="text-sm font-semibold text-blue-900">' + escapeHtml(PALACE_LABELS[palace.name] || palace.name) +
        (palace.isBodyPalace ? '<span class="ml-1 text-[10px] text-blue-700">신궁</span>' : '') + '</div>' +
      '<span class="text-xs text-slate-500 shrink-0">' + escapeHtml(palace.heavenlyStem + palace.earthlyBranch) + '</span>' +
    '</div>' +
    '<div class="flex flex-wrap gap-1">' + majors + '</div>' +
    (minors ? '<div class="mt-1 flex flex-wrap gap-1">' + minors + '</div>' : '') +
    (adjectives ? '<details class="mt-2 text-[11px] text-slate-500"><summary class="cursor-pointer">기타 별</summary><div class="mt-1">' + adjectives + '</div></details>' : '') +
    (palace.decadalRange ? '<div class="mt-2 text-[11px] text-slate-500">대운 ' + palace.decadalRange[0] + '~' + palace.decadalRange[1] + '세</div>' : '') +
  '</section>';
}

function renderChart(result) {
  const palaces = result.palaces.map(renderPalace).join('');
  const center = '<div style="grid-column:2 / span 2;grid-row:2 / span 2" class="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 flex flex-col justify-center text-center">' +
    '<div class="text-xl font-bold text-blue-900">자미두수 명반</div>' +
    '<div class="mt-2 text-sm text-slate-700">양력 ' + escapeHtml(result.solarDate) + '</div>' +
    '<div class="text-sm text-slate-700">' + escapeHtml(result.lunarDate) + '</div>' +
    '<div class="mt-1 text-sm text-slate-700">' + escapeHtml(result.time) + ' · ' + escapeHtml(result.timeRange) + '</div>' +
    '<div class="mt-3 text-xs text-slate-500">오행국 ' + escapeHtml(result.fiveElementsClass) + ' · 명주 ' + escapeHtml(result.soul) + ' · 신주 ' + escapeHtml(result.body) + '</div>' +
  '</div>';
  return '<div class="text-xs text-slate-500 mb-2 md:hidden">좌우로 움직여 12궁을 확인하세요.</div>' +
    '<div class="overflow-x-auto pb-2"><div class="grid gap-2 min-w-[720px] bg-slate-100 rounded-2xl p-2" style="grid-template-columns:repeat(4,minmax(170px,1fr));grid-template-rows:repeat(4,minmax(160px,auto))">' +
      palaces + center + '</div></div>' +
    '<div class="mt-3 text-xs text-slate-500">보라색은 주성, 회색은 보조성입니다. 化록·권·과·기는 사화 표기입니다. 별 배치와 해석은 유파에 따라 달라질 수 있습니다.</div>';
}

function renderReading(result) {
  const areas = result.reading.map((area) =>
    '<div class="p-3 rounded-xl border bg-slate-50"><div class="font-semibold text-sm text-blue-900">' +
      escapeHtml(area.label) + ' · ' + escapeHtml(PALACE_LABELS[area.palace] || area.palace) +
    '</div><p class="mt-1 text-sm leading-6 text-slate-700">' + escapeHtml(area.text) + '</p></div>'
  ).join('');
  return '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + areas + '</div>' +
    '<p class="mt-3 text-xs text-slate-500">별의 대표적인 상징을 소개하는 간단한 풀이입니다. 개별 사건이나 결과를 확정하지 않습니다.</p>';
}

function renderResult(result) {
  return card("12궁 명반", renderChart(result)) + card("궁별 간단 풀이", renderReading(result));
}

export function ZiweiPage(state) {
  return '<div class="space-y-4">' +
    '<div class="ziwei-intro-grid">' +
      card("자미두수란?", '<div class="text-sm leading-7 text-slate-700">자미두수는 출생 연월일시로 12궁에 별을 배치해 삶의 여러 영역을 살펴보는 전통 운명학입니다. 사주가 음양오행과 네 기둥을 중심으로 읽는다면, 자미두수는 명궁·부부궁·재백궁·관록궁 등의 별 조합을 중심으로 읽습니다.</div>') +
      card("출생 정보", birthForm(state), '<div class="text-xs text-slate-500">출생지 경도와 진태양시 보정은 적용하지 않습니다. 23시는 야자시, 0시는 조자시로 계산합니다. 윤달은 앞뒤 보정 규칙을 사용합니다.</div>') +
    '</div>' +
    '<div id="ziweiResult" class="space-y-4">' + (state.ziweiResult ? renderResult(state.ziweiResult) : '') + '</div>' +
  '</div>';
}

export function ZiweiMount(state) {
  const form = document.getElementById("ziweiForm");
  const message = document.getElementById("ziweiMessage");
  const resultEl = document.getElementById("ziweiResult");
  const calendarSelect = form?.elements.namedItem("calendarType");
  const leap = form?.elements.namedItem("isLeapMonth");
  const leapLabel = document.getElementById("ziweiLeapLabel");

  calendarSelect?.addEventListener("change", () => {
    const isLunar = calendarSelect.value === "lunar";
    leapLabel?.classList.toggle("hidden", !isLunar);
    if (!isLunar && leap) leap.checked = false;
  });

  async function calculate() {
    const fd = new FormData(form);
    const input = {
      calendarType: String(fd.get("calendarType")),
      isLeapMonth: !!fd.get("isLeapMonth"),
      year: Number(fd.get("year")),
      month: Number(fd.get("month")),
      day: Number(fd.get("day")),
      hour: Number(fd.get("hour")),
      minute: Number(fd.get("minute")),
      gender: String(fd.get("gender")),
    };
    state.ziweiResult = null;
    resultEl.innerHTML = "";
    message.innerHTML = alertBox("info", "명반을 계산하고 있습니다...");
    try {
      const data = await calcZiwei(input);
      state.ziweiForm = input;
      state.ziweiResult = data.result;
      resultEl.innerHTML = renderResult(data.result);
      message.innerHTML = "";
    } catch (error) {
      message.innerHTML = alertBox("error", error.message || String(error));
    }
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
  });
  if (state.form && !state.ziweiResult) calculate();
}
