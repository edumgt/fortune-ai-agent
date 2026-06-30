import { card, alertBox, escapeHtml } from "../ui/components.js";
import { getMbtiQuestions, calcMbti } from "../api.js";

function renderQuestion(q, idx, picked) {
  return `
    <div class="p-3 rounded-xl border bg-white">
      <div class="text-sm font-medium mb-2">Q${idx + 1}. 더 가까운 쪽을 선택하세요</div>
      <label class="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
        <input type="radio" name="q${q.id}" value="a" ${picked === "a" ? "checked" : ""} required class="mt-1" />
        <span class="text-sm">${escapeHtml(q.a.text)}</span>
      </label>
      <label class="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
        <input type="radio" name="q${q.id}" value="b" ${picked === "b" ? "checked" : ""} required class="mt-1" />
        <span class="text-sm">${escapeHtml(q.b.text)}</span>
      </label>
    </div>`;
}

function axisBar(label, leftKey, rightKey, scores) {
  const total = scores[leftKey] + scores[rightKey] || 1;
  const leftPct = Math.round((scores[leftKey] / total) * 100);
  return `
    <div class="text-xs mb-2">
      <div class="flex justify-between mb-1"><span>${leftKey} ${scores[leftKey]}</span><span>${rightKey} ${scores[rightKey]}</span></div>
      <div class="h-2 bg-slate-100 rounded-full overflow-hidden flex">
        <div class="bg-gradient-to-r from-indigo-600 to-fuchsia-600 h-full" style="width:${leftPct}%"></div>
      </div>
    </div>`;
}

export function MbtiPage(state) {
  return `
    <div class="space-y-4">
      ${card("MBTI 간이 성격유형 검사", `<div id="mbtiQuiz">${alertBox("info", "질문을 불러오는 중...")}</div>`)}
      <div id="mbtiResult"></div>
    </div>
  `;
}

export async function MbtiMount(state) {
  const quizEl = document.getElementById("mbtiQuiz");
  const resultEl = document.getElementById("mbtiResult");
  if (!quizEl) return;

  state.mbtiAnswers = state.mbtiAnswers || {};

  let questions;
  try {
    const data = await getMbtiQuestions();
    questions = data.questions;
  } catch (err) {
    quizEl.innerHTML = alertBox("error", `질문을 불러오지 못했습니다: ${err.message}`);
    return;
  }

  quizEl.innerHTML = `
    <form id="mbtiForm" class="space-y-3">
      ${questions.map((q, i) => renderQuestion(q, i, state.mbtiAnswers[q.id])).join("")}
      <button type="submit" class="btn-primary">결과 보기</button>
    </form>
  `;

  const form = document.getElementById("mbtiForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const answers = questions.map((q) => {
      const v = fd.get(`q${q.id}`);
      state.mbtiAnswers[q.id] = v;
      return v;
    });

    if (resultEl) resultEl.innerHTML = alertBox("info", "분석 중...");
    try {
      const { result } = await calcMbti(answers);
      if (resultEl) {
        resultEl.innerHTML = card(`결과: ${escapeHtml(result.type)}`, `
          <div class="space-y-3">
            <div class="text-lg font-semibold">${escapeHtml(result.title)}</div>
            <div class="text-sm text-slate-700">${escapeHtml(result.description)}</div>
            <div class="pt-2 border-t">
              ${axisBar("EI", "E", "I", result.axisScores.EI)}
              ${axisBar("SN", "S", "N", result.axisScores.SN)}
              ${axisBar("TF", "T", "F", result.axisScores.TF)}
              ${axisBar("JP", "J", "P", result.axisScores.JP)}
            </div>
          </div>
        `);
      }
    } catch (err) {
      if (resultEl) resultEl.innerHTML = alertBox("error", `오류: ${err.message}`);
    }
  });
}
