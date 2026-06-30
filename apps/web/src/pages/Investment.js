import { card, alertBox, escapeHtml } from "../ui/components.js";
import { getInvestmentQuestions, calcInvestment } from "../api.js";

const GOAL_OPTIONS = [
  { value: "retirement", label: "은퇴자금 마련" },
  { value: "home", label: "주택자금 마련" },
  { value: "education", label: "자녀교육자금 마련" },
  { value: "shortTermProfit", label: "단기 수익 추구" },
  { value: "wealthBuilding", label: "장기 자산증식" },
];

function renderQuestion(q, idx) {
  return `
    <div class="p-3 rounded-xl border bg-white">
      <div class="text-sm font-medium mb-2">${idx + 1}. ${escapeHtml(q.text)}</div>
      ${q.options.map((o) => `
        <label class="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
          <input type="radio" name="q${q.id}" value="${o.index}" required class="mt-1" />
          <span class="text-sm">${escapeHtml(o.text)}</span>
        </label>
      `).join("")}
    </div>`;
}

function allocationBars(allocation) {
  const colors = { 예적금: "bg-sky-400", 채권: "bg-emerald-400", 주식: "bg-rose-400", 대체투자: "bg-amber-400" };
  return Object.entries(allocation).map(([k, v]) => `
    <div class="flex items-center gap-2 text-xs">
      <span class="w-14 shrink-0">${escapeHtml(k)}</span>
      <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div class="${colors[k] || "bg-slate-400"} h-full rounded-full" style="width:${v}%"></div>
      </div>
      <span class="w-10 text-right font-semibold">${v}%</span>
    </div>
  `).join("");
}

export function InvestmentPage(state) {
  return `
    <div class="space-y-4">
      ${card("투자성향분석 설문", `<div id="investmentQuiz">${alertBox("info", "질문을 불러오는 중...")}</div>`)}
      <div id="investmentResult"></div>
    </div>
  `;
}

export async function InvestmentMount(state) {
  const quizEl = document.getElementById("investmentQuiz");
  const resultEl = document.getElementById("investmentResult");
  if (!quizEl) return;

  let questions;
  try {
    const data = await getInvestmentQuestions();
    questions = data.questions;
  } catch (err) {
    quizEl.innerHTML = alertBox("error", `질문을 불러오지 못했습니다: ${err.message}`);
    return;
  }

  quizEl.innerHTML = `
    <form id="investmentForm" class="space-y-4">
      <div class="p-3 rounded-xl border bg-slate-50 space-y-3">
        <div class="text-sm font-medium text-slate-700">개인정보 (선택 입력 — 맞춤 리포트에 반영됩니다)</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-600">나이</label>
            <input name="age" type="number" min="1" max="120" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="예: 35" />
          </div>
          <div>
            <label class="text-xs text-slate-600">투자 기간(년)</label>
            <input name="investmentHorizonYears" type="number" min="0" max="60" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="예: 10" />
          </div>
          <div>
            <label class="text-xs text-slate-600">투자 목표</label>
            <select name="investmentGoal" class="w-full px-3 py-2 rounded-xl border bg-white">
              <option value="">선택 안 함</option>
              ${GOAL_OPTIONS.map((g) => `<option value="${g.value}">${escapeHtml(g.label)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-600">월 투자가능금액(원)</label>
            <input name="monthlyInvestableAmount" type="number" min="0" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="예: 500000" />
          </div>
        </div>
      </div>

      ${questions.map((q, i) => renderQuestion(q, i)).join("")}
      <button type="submit" class="btn-primary">투자성향 분석하기</button>
    </form>
  `;

  const form = document.getElementById("investmentForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const answers = questions.map((q) => Number(fd.get(`q${q.id}`)));
    const personalInfo = {
      age: fd.get("age") ? Number(fd.get("age")) : undefined,
      investmentHorizonYears: fd.get("investmentHorizonYears") ? Number(fd.get("investmentHorizonYears")) : undefined,
      investmentGoal: fd.get("investmentGoal") || undefined,
      monthlyInvestableAmount: fd.get("monthlyInvestableAmount") ? Number(fd.get("monthlyInvestableAmount")) : undefined,
    };

    if (resultEl) resultEl.innerHTML = alertBox("info", "분석 중...");
    try {
      const { result } = await calcInvestment(answers, personalInfo);
      if (resultEl) {
        resultEl.innerHTML = card(`투자성향: ${escapeHtml(result.type)}`, `
          <div class="space-y-4">
            <div class="text-sm text-slate-700">${escapeHtml(result.description)}</div>
            <div class="text-xs text-slate-500">설문 점수: ${result.totalScore} / ${result.maxScore}</div>
            <div class="space-y-2">
              <div class="text-sm font-medium">추천 자산배분</div>
              ${allocationBars(result.recommendedAllocation)}
            </div>
            <div class="pt-2 border-t space-y-2">
              <div class="text-sm font-medium">투자 가이드 리포트</div>
              <ul class="space-y-1.5 text-sm text-slate-700 list-disc pl-4">
                ${result.report.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
              </ul>
            </div>
          </div>
        `);
      }
    } catch (err) {
      if (resultEl) resultEl.innerHTML = alertBox("error", `오류: ${err.message}`);
    }
  });
}
