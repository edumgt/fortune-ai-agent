import { card, alertBox, escapeHtml } from "../ui/components.js";
import { calcSaju } from "../api.js";

function defaultForm() {
  return {
    year: 1990,
    month: 1,
    day: 1,
    hour: 9,
    minute: 0,
    gender: "M",
    longitude: 127,
    applyTimeCorrection: true,
  };
}

export function HomePage(state) {
  const f = state.form || defaultForm();
  state.form = f;

  const formCard = card(
    "내 사주 계산",
    `
    <p class="mb-5 text-sm text-slate-600">태어난 날짜와 시간을 입력하면 사주팔자, 오행, 대운을 한 번에 확인할 수 있습니다.</p>
    <form id="sajuForm" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div>
        <label class="text-sm font-semibold text-slate-700">생년</label>
        <input name="year" type="number" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.year}" required />
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-700">성별</label>
        <select name="gender" class="w-full px-3 py-2 rounded-xl border bg-white">
          <option value="M" ${f.gender==="M"?"selected":""}>남</option>
          <option value="F" ${f.gender==="F"?"selected":""}>여</option>
        </select>
      </div>

      <div>
        <label class="text-sm font-semibold text-slate-700">월</label>
        <input name="month" type="number" min="1" max="12" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.month}" required />
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-700">일</label>
        <input name="day" type="number" min="1" max="31" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.day}" required />
      </div>

      <div>
        <label class="text-sm font-semibold text-slate-700">시</label>
        <input name="hour" type="number" min="0" max="23" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.hour}" required />
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-700">분</label>
        <input name="minute" type="number" min="0" max="59" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.minute}" required />
      </div>

      <div>
        <label class="text-sm font-semibold text-slate-700">경도(옵션)</label>
        <input name="longitude" type="number" step="0.01" class="w-full px-3 py-2 rounded-xl border bg-white" value="${f.longitude}" />
        <div class="text-[11px] text-slate-500 mt-1">기본 127(서울 근처). 시간보정에 사용</div>
      </div>

      <div class="flex items-center gap-2 mt-5 md:mt-0">
        <input id="applyTimeCorrection" name="applyTimeCorrection" type="checkbox" class="w-4 h-4"
          ${f.applyTimeCorrection ? "checked" : ""} />
        <label for="applyTimeCorrection" class="text-sm">시간보정 적용</label>
      </div>

      <div class="sm:col-span-2 xl:col-span-4 flex flex-wrap gap-2 mt-2">
        <button type="submit" class="btn-primary">계산하기</button>
        <a href="#/daeun" class="btn-secondary">대운 페이지로</a>
      </div>
    </form>

    <div id="homeMsg" class="mt-4"></div>
    `,
    alertBox("warn", "사주와 운세는 참고용입니다. 야자시와 대운 기산 규칙은 유파에 따라 다를 수 있습니다.")
  );

  return `
    <div class="space-y-5">
      <section class="feature-grid" aria-label="주요 운세 서비스">
        <article class="feature-card featured">
          <span class="feature-badge">사주팔자 · 오행</span>
          <h1 class="feature-title">내 사주 분석</h1>
          <p class="feature-description">태어난 시각의 네 기둥과 오행을 읽고, 대운의 흐름까지 살펴보세요.</p>
          <button id="focusSaju" type="button" class="feature-action btn-primary">사주 입력하기 →</button>
        </article>
        <article class="feature-card">
          <span class="feature-badge">12궁 명반</span>
          <h2 class="feature-title">자미두수</h2>
          <p class="feature-description">명궁과 부부궁, 재백궁 등에 놓인 별을 시각적인 명반으로 확인하세요.</p>
          <a class="feature-action btn-secondary" href="#/ziwei">명반 만들기 →</a>
        </article>
        <article class="feature-card">
          <span class="feature-badge">두 사람의 관계</span>
          <h2 class="feature-title">궁합 분석</h2>
          <p class="feature-description">두 사람의 사주를 나란히 살펴보고 관계의 합과 충을 확인하세요.</p>
          <a class="feature-action btn-secondary" href="#/gunghap">궁합 보기 →</a>
        </article>
        <article class="feature-card">
          <span class="feature-badge">하루의 흐름</span>
          <h2 class="feature-title">오늘 운세</h2>
          <p class="feature-description">오늘의 일진과 함께 연애, 일, 재물, 건강의 흐름을 살펴보세요.</p>
          <a class="feature-action btn-secondary" href="#/daily">오늘 운세 보기 →</a>
        </article>
      </section>
      ${formCard}
    </div>
  `;
}

export function HomeMount(state) {
  const msg = document.getElementById("homeMsg");
  const form = document.getElementById("sajuForm");
  document.getElementById("focusSaju")?.addEventListener("click", () => {
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    form?.querySelector('[name="year"]')?.focus({ preventScroll: true });
  });
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.innerHTML = alertBox("info", "계산 중...");

    const fd = new FormData(form);
    const input = {
      year: Number(fd.get("year")),
      month: Number(fd.get("month")),
      day: Number(fd.get("day")),
      hour: Number(fd.get("hour")),
      minute: Number(fd.get("minute")),
      gender: String(fd.get("gender")),
      longitude: Number(fd.get("longitude") || 127),
      applyTimeCorrection: !!fd.get("applyTimeCorrection"),
    };
    state.form = input;

    try {
      const data = await calcSaju(input);
      state.lastResult = data.result;
      state.ziweiForm = null;
      state.ziweiResult = null;
      location.hash = "#/result";
    } catch (err) {
      if (msg) msg.innerHTML = alertBox("error", `오류: ${err.message || err}`);
    }
  });
}
