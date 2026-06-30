/**
 * 투자성향분석 (증권사 표준투자권유준칙 스타일 설문, 10문항)
 * - 10개 문항(4지선다) 총점으로 5단계 투자성향 분류
 * - 개인정보(나이/투자기간/목표/월 투자가능금액)를 반영해 자산배분을 보정하고
 *   "어떻게 투자하는 것이 좋다"는 서술형 리포트를 생성한다
 */
const QUESTIONS = [
  {
    id: 1,
    text: "투자 가능한 자금의 투자 기간은 얼마나 되나요?",
    options: [
      { text: "6개월 이내", score: 1 },
      { text: "6개월~1년", score: 2 },
      { text: "1년~2년", score: 3 },
      { text: "2년 이상", score: 4 },
    ],
  },
  {
    id: 2,
    text: "투자 경험은 어느 정도인가요?",
    options: [
      { text: "투자 경험이 없다", score: 1 },
      { text: "예적금/채권 위주 경험이 있다", score: 2 },
      { text: "펀드/주식 투자 경험이 있다", score: 3 },
      { text: "파생상품 등 고위험 투자 경험이 있다", score: 4 },
    ],
  },
  {
    id: 3,
    text: "보유 자산 중 투자에 활용할 비중은?",
    options: [
      { text: "10% 이하", score: 1 },
      { text: "10~30%", score: 2 },
      { text: "30~50%", score: 3 },
      { text: "50% 이상", score: 4 },
    ],
  },
  {
    id: 4,
    text: "소득 대비 정기적인 수입의 안정성은?",
    options: [
      { text: "수입이 없거나 불규칙하다", score: 1 },
      { text: "수입은 있으나 변동이 크다", score: 2 },
      { text: "안정적인 고정 수입이 있다", score: 3 },
      { text: "충분한 여유 자금과 안정적 수입이 있다", score: 4 },
    ],
  },
  {
    id: 5,
    text: "투자 원금에 손실이 발생한다면 감내할 수 있는 수준은?",
    options: [
      { text: "원금 손실은 절대 원하지 않는다", score: 1 },
      { text: "10% 내외 손실까지는 감수할 수 있다", score: 2 },
      { text: "20~30% 손실까지는 감수할 수 있다", score: 3 },
      { text: "원금 전체 손실 가능성도 감수할 수 있다", score: 4 },
    ],
  },
  {
    id: 6,
    text: "다음 중 가장 선호하는 투자 방식은?",
    options: [
      { text: "예금, 적금 등 원금 보장 상품", score: 1 },
      { text: "국공채, 우량 회사채 등 안전자산 위주", score: 2 },
      { text: "주식형 펀드 등 분산투자 상품", score: 3 },
      { text: "개별 주식, 코인, 파생상품 등 고위험 고수익 상품", score: 4 },
    ],
  },
  {
    id: 7,
    text: "투자한 자산의 가치가 한 달 만에 20% 하락했다면?",
    options: [
      { text: "즉시 전량 매도한다", score: 1 },
      { text: "일부 매도하여 손실을 줄인다", score: 2 },
      { text: "추이를 지켜보며 보유한다", score: 3 },
      { text: "저가 매수 기회로 보고 추가 매수한다", score: 4 },
    ],
  },
  {
    id: 8,
    text: "투자의 주된 목적은?",
    options: [
      { text: "원금 보존 및 안전한 보관", score: 1 },
      { text: "물가상승률을 상회하는 안정적 수익", score: 2 },
      { text: "중장기적인 자산 증식", score: 3 },
      { text: "단기간 높은 수익 추구", score: 4 },
    ],
  },
  {
    id: 9,
    text: "기대하는 연평균 목표 수익률은?",
    options: [
      { text: "예금 금리 수준(연 2~3%)", score: 1 },
      { text: "연 5% 내외", score: 2 },
      { text: "연 10% 내외", score: 3 },
      { text: "연 20% 이상", score: 4 },
    ],
  },
  {
    id: 10,
    text: "보유 자산 가치가 크게 떨어지면 심리적으로 어떤가요?",
    options: [
      { text: "잠을 설칠 정도로 불안하다", score: 1 },
      { text: "신경이 쓰이지만 일상에 지장은 없다", score: 2 },
      { text: "장기적인 관점에서 크게 동요하지 않는다", score: 3 },
      { text: "오히려 추가 투자 기회로 여겨진다", score: 4 },
    ],
  },
];

const PROFILES = [
  {
    type: "안정형",
    range: [10, 16],
    desc: "원금 손실을 원하지 않으며 안전성을 최우선으로 생각하는 유형입니다.",
    allocation: { 예적금: 70, 채권: 25, 주식: 5, 대체투자: 0 },
  },
  {
    type: "안정추구형",
    range: [17, 23],
    desc: "약간의 손실은 감수하되 안정적인 수익을 선호하는 유형입니다.",
    allocation: { 예적금: 45, 채권: 35, 주식: 15, 대체투자: 5 },
  },
  {
    type: "위험중립형",
    range: [24, 30],
    desc: "수익과 위험의 균형을 추구하며 적정 수준의 손실은 감내하는 유형입니다.",
    allocation: { 예적금: 25, 채권: 30, 주식: 35, 대체투자: 10 },
  },
  {
    type: "적극투자형",
    range: [31, 35],
    desc: "높은 수익을 위해 상당한 손실 위험을 감수할 수 있는 유형입니다.",
    allocation: { 예적금: 10, 채권: 15, 주식: 55, 대체투자: 20 },
  },
  {
    type: "공격투자형",
    range: [36, 40],
    desc: "시장 평균을 크게 상회하는 수익을 위해 높은 변동성과 손실 위험까지 감수하는 유형입니다.",
    allocation: { 예적금: 5, 채권: 5, 주식: 60, 대체투자: 30 },
  },
];

const GOAL_LABELS = {
  retirement: "은퇴자금 마련",
  home: "주택자금 마련",
  education: "자녀교육자금 마련",
  shortTermProfit: "단기 수익 추구",
  wealthBuilding: "장기 자산증식",
};

function getQuestions() {
  return QUESTIONS.map(({ id, text, options }) => ({
    id,
    text,
    options: options.map((o, idx) => ({ index: idx, text: o.text })),
  }));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/** 나이/투자기간에 따라 주식 비중을 가감하고, 차액을 안전자산군에서 비례 조정 */
function applyPersonalAdjustment(allocation, personalInfo) {
  let stockDelta = 0;
  const age = Number(personalInfo?.age);
  const horizon = Number(personalInfo?.investmentHorizonYears);

  if (Number.isFinite(age)) {
    if (age < 35) stockDelta += 10;
    else if (age >= 55) stockDelta -= 10;
  }
  if (Number.isFinite(horizon)) {
    if (horizon >= 10) stockDelta += 5;
    else if (horizon <= 2) stockDelta -= 10;
  }
  stockDelta = clamp(stockDelta, -20, 20);
  if (stockDelta === 0) return { ...allocation };

  const newStock = clamp(allocation.주식 + stockDelta, 0, 100);
  const actualDelta = newStock - allocation.주식;
  const others = ["예적금", "채권", "대체투자"];
  const othersTotal = others.reduce((s, k) => s + allocation[k], 0);

  const result = { ...allocation, 주식: newStock };
  if (othersTotal > 0) {
    others.forEach((k) => {
      const share = allocation[k] / othersTotal;
      result[k] = Math.max(0, Math.round(allocation[k] - actualDelta * share));
    });
  }
  const sum = result.주식 + result.예적금 + result.채권 + result.대체투자;
  result.예적금 += 100 - sum; // rounding 보정
  return result;
}

function buildReport({ profile, personalInfo, allocation, totalScore, maxScore }) {
  const lines = [];

  lines.push(
    `설문 점수 ${totalScore}/${maxScore}점으로 '${profile.type}'에 해당합니다. ${profile.desc}`
  );

  lines.push(
    `추천 자산배분: 예적금 ${allocation.예적금}% · 채권 ${allocation.채권}% · 주식 ${allocation.주식}% · 대체투자 ${allocation.대체투자}%`
  );

  const age = Number(personalInfo?.age);
  if (Number.isFinite(age)) {
    if (age < 35) {
      lines.push(`${age}세는 투자 손실을 회복할 시간적 여유가 많은 연령대이므로, 변동성이 있더라도 주식·성장자산 비중을 상대적으로 높여볼 수 있습니다.`);
    } else if (age < 55) {
      lines.push(`${age}세는 자산 증식과 안정성을 함께 고려해야 하는 시기로, 주식과 안전자산을 균형 있게 배분하는 전략이 적합합니다.`);
    } else {
      lines.push(`${age}세는 은퇴 시점이 가까워지는 만큼, 변동성이 큰 자산 비중을 점차 줄이고 채권·예적금 등 안전자산 비중을 늘리는 것이 바람직합니다.`);
    }
  }

  const horizon = Number(personalInfo?.investmentHorizonYears);
  if (Number.isFinite(horizon)) {
    if (horizon >= 10) {
      lines.push(`투자 기간이 ${horizon}년으로 장기인 만큼, 단기 변동성에 흔들리지 않고 장기 성장자산(주식·대체투자) 비중을 유지하는 전략이 유리합니다.`);
    } else if (horizon <= 2) {
      lines.push(`투자 기간이 ${horizon}년으로 짧은 편이므로, 단기 변동성에 노출되는 자산보다는 유동성이 높은 안전자산 위주로 운용하는 것이 좋습니다.`);
    } else {
      lines.push(`투자 기간이 ${horizon}년 정도로 중기인 만큼, 일정 부분 안전자산을 유지하면서 중기 성장자산에도 분산 투자하는 것이 좋습니다.`);
    }
  }

  const goal = GOAL_LABELS[personalInfo?.investmentGoal];
  if (goal) {
    lines.push(`'${goal}'이 목표라면, 목표 시점이 가까워질수록 자산배분을 점진적으로 안전자산 쪽으로 옮겨가는 글라이드 패스 전략을 함께 고려하세요.`);
  }

  const monthly = Number(personalInfo?.monthlyInvestableAmount);
  if (Number.isFinite(monthly) && monthly > 0) {
    const fmt = (pct) => Math.round((monthly * pct) / 100).toLocaleString("ko-KR");
    lines.push(
      `월 투자가능금액 ${monthly.toLocaleString("ko-KR")}원 기준 제안 배분: 예적금 ${fmt(allocation.예적금)}원 · 채권 ${fmt(allocation.채권)}원 · 주식 ${fmt(allocation.주식)}원 · 대체투자 ${fmt(allocation.대체투자)}원`
    );
    lines.push("목돈을 한 번에 투입하기보다 매월 일정 금액을 나누어 투자하는 적립식(분할매수) 전략이 변동성을 낮추는 데 도움이 됩니다.");
  }

  lines.push("정기적으로(예: 분기 1회) 자산배분 비중을 점검하고 목표 비중과 어긋나면 리밸런싱하는 것을 권장합니다.");
  lines.push("본 분석은 참고용 데모이며, 실제 투자 결정은 추가적인 전문가 상담을 거치는 것이 좋습니다.");

  return lines;
}

function scoreInvestment({ answers, personalInfo } = {}) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    throw new Error(`answers must be an array of ${QUESTIONS.length} option indexes (0-3)`);
  }

  let total = 0;
  QUESTIONS.forEach((q, idx) => {
    const optionIdx = answers[idx];
    const option = q.options[optionIdx];
    if (!option) throw new Error(`answers[${idx}] must be an option index between 0 and ${q.options.length - 1}`);
    total += option.score;
  });

  const profile = PROFILES.find((p) => total >= p.range[0] && total <= p.range[1]) || PROFILES[PROFILES.length - 1];
  const allocation = applyPersonalAdjustment(profile.allocation, personalInfo);
  const maxScore = QUESTIONS.length * 4;

  const report = buildReport({ profile, personalInfo, allocation, totalScore: total, maxScore });

  return {
    totalScore: total,
    maxScore,
    type: profile.type,
    description: profile.desc,
    baseAllocation: profile.allocation,
    recommendedAllocation: allocation,
    personalInfo: personalInfo || null,
    report,
  };
}

module.exports = { getQuestions, scoreInvestment };
