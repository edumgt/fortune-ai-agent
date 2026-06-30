/**
 * 간이 MBTI 성격 유형 검사
 * - 4개 이분지표(EI/SN/TF/JP) x 각 5문항, 총 20문항
 * - 사용자가 각 문항마다 a/b 중 선택 → 지표별 우세 글자로 유형 산출
 */
const QUESTIONS = [
  { id: 1, axis: "EI", a: { value: "E", text: "새로운 사람들과 만나면 에너지가 생긴다" }, b: { value: "I", text: "혼자만의 시간으로 에너지를 회복한다" } },
  { id: 2, axis: "EI", a: { value: "E", text: "생각보다 말이 먼저 나오는 편이다" }, b: { value: "I", text: "말하기 전에 충분히 생각을 정리한다" } },
  { id: 3, axis: "EI", a: { value: "E", text: "모임에서 먼저 말을 거는 편이다" }, b: { value: "I", text: "다가오는 사람과 대화하는 편이다" } },
  { id: 4, axis: "EI", a: { value: "E", text: "여러 사람과 함께 일할 때 활기가 돈다" }, b: { value: "I", text: "소수와 깊게 일할 때 집중이 잘 된다" } },
  { id: 5, axis: "EI", a: { value: "E", text: "주말엔 약속을 잡고 밖으로 나간다" }, b: { value: "I", text: "주말엔 집에서 휴식을 취한다" } },

  { id: 6, axis: "SN", a: { value: "S", text: "구체적인 사실과 경험을 중시한다" }, b: { value: "N", text: "가능성과 아이디어에 끌린다" } },
  { id: 7, axis: "SN", a: { value: "S", text: "현재 눈앞의 일에 집중한다" }, b: { value: "N", text: "미래의 의미와 패턴을 먼저 본다" } },
  { id: 8, axis: "SN", a: { value: "S", text: "실용적이고 단계적인 설명을 선호한다" }, b: { value: "N", text: "비유와 큰 그림으로 설명하는 걸 선호한다" } },
  { id: 9, axis: "SN", a: { value: "S", text: "검증된 방식을 따르는 게 편하다" }, b: { value: "N", text: "새로운 방식을 시도하는 게 흥미롭다" } },
  { id: 10, axis: "SN", a: { value: "S", text: "디테일을 잘 챙긴다는 말을 듣는다" }, b: { value: "N", text: "엉뚱한 상상을 잘 한다는 말을 듣는다" } },

  { id: 11, axis: "TF", a: { value: "T", text: "결정할 때 논리와 원칙을 우선한다" }, b: { value: "F", text: "결정할 때 사람의 감정과 영향을 우선한다" } },
  { id: 12, axis: "TF", a: { value: "T", text: "비판을 받아도 사실관계 위주로 받아들인다" }, b: { value: "F", text: "비판을 받으면 감정적으로도 영향을 받는다" } },
  { id: 13, axis: "TF", a: { value: "T", text: "문제 해결이 위로보다 우선이라 생각한다" }, b: { value: "F", text: "공감과 위로가 해결보다 먼저라 생각한다" } },
  { id: 14, axis: "TF", a: { value: "T", text: "옳고 그름을 명확히 따지는 편이다" }, b: { value: "F", text: "관계의 조화를 더 중요하게 생각한다" } },
  { id: 15, axis: "TF", a: { value: "T", text: "효율과 결과를 기준으로 평가한다" }, b: { value: "F", text: "노력과 의도를 기준으로 평가한다" } },

  { id: 16, axis: "JP", a: { value: "J", text: "계획을 세우고 그대로 진행해야 마음이 편하다" }, b: { value: "P", text: "상황에 맞춰 유연하게 바꾸는 게 편하다" } },
  { id: 17, axis: "JP", a: { value: "J", text: "할 일을 미리 끝내 놓는 편이다" }, b: { value: "P", text: "마감이 다가와야 몰입이 잘 된다" } },
  { id: 18, axis: "JP", a: { value: "J", text: "정리정돈된 일정표가 있어야 안심된다" }, b: { value: "P", text: "즉흥적인 일정 변경도 즐긴다" } },
  { id: 19, axis: "JP", a: { value: "J", text: "결정을 내리면 빨리 마무리 짓고 싶다" }, b: { value: "P", text: "결정을 미루고 옵션을 열어두고 싶다" } },
  { id: 20, axis: "JP", a: { value: "J", text: "여행은 일정표를 세워서 다닌다" }, b: { value: "P", text: "여행은 즉흥적으로 다니는 게 좋다" } },
];

const TYPE_INFO = {
  ISTJ: { title: "청렴결백한 논리주의자", desc: "신중하고 책임감이 강하며, 원칙과 사실에 기반해 꾸준히 일을 완수합니다." },
  ISFJ: { title: "용감한 수호자", desc: "헌신적이고 따뜻하며, 주변 사람을 세심하게 챙기는 안정적인 조력자입니다." },
  INFJ: { title: "선의의 옹호자", desc: "통찰력 있고 이상주의적이며, 의미와 가치를 좇아 깊이 있게 사고합니다." },
  INTJ: { title: "용의주도한 전략가", desc: "독립적이고 분석적이며, 장기적인 계획과 큰 그림을 그리는 데 강합니다." },
  ISTP: { title: "만능 재주꾼", desc: "차분하고 실용적이며, 문제가 생기면 직접 손으로 해결하길 좋아합니다." },
  ISFP: { title: "호기심 많은 예술가", desc: "온화하고 감각적이며, 자신만의 미적 기준과 가치관을 조용히 따릅니다." },
  INFP: { title: "열정적인 중재자", desc: "이상과 가치를 소중히 여기며, 따뜻한 공감 능력으로 사람을 살핍니다." },
  INTP: { title: "논리적인 사색가", desc: "호기심이 강하고 분석적이며, 새로운 개념과 이론 탐구를 즐깁니다." },
  ESTP: { title: "모험을 즐기는 사업가", desc: "활동적이고 현실적이며, 즉각적인 문제 해결과 실행력이 뛰어납니다." },
  ESFP: { title: "자유로운 영혼의 연예인", desc: "사교적이고 즉흥적이며, 주변에 활기와 즐거움을 전합니다." },
  ENFP: { title: "재기발랄한 활동가", desc: "열정적이고 창의적이며, 사람과 가능성에 대한 호기심이 넘칩니다." },
  ENTP: { title: "뜨거운 논쟁을 즐기는 변론가", desc: "기지가 넘치고 도전적이며, 새로운 아이디어로 토론하길 즐깁니다." },
  ESTJ: { title: "엄격한 관리자", desc: "체계적이고 결단력이 있으며, 조직을 효율적으로 이끄는 데 능합니다." },
  ESFJ: { title: "사교적인 외교관", desc: "친절하고 협조적이며, 공동체의 조화와 화합을 중시합니다." },
  ENFJ: { title: "정의로운 사회운동가", desc: "카리스마 있고 이타적이며, 사람들의 성장을 이끄는 데 탁월합니다." },
  ENTJ: { title: "대담한 통솔자", desc: "추진력 있고 전략적이며, 목표 달성을 위해 사람과 자원을 이끕니다." },
};

function getQuestions() {
  return QUESTIONS.map(({ id, axis, a, b }) => ({ id, axis, a, b }));
}

function scoreMbti(answers) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    throw new Error(`answers must be an array of ${QUESTIONS.length} values ("a" or "b")`);
  }

  const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  QUESTIONS.forEach((q, idx) => {
    const picked = answers[idx];
    if (picked !== "a" && picked !== "b") throw new Error(`answers[${idx}] must be "a" or "b"`);
    const trait = picked === "a" ? q.a.value : q.b.value;
    counts[trait]++;
  });

  const type =
    (counts.E >= counts.I ? "E" : "I") +
    (counts.S >= counts.N ? "S" : "N") +
    (counts.T >= counts.F ? "T" : "F") +
    (counts.J >= counts.P ? "J" : "P");

  const info = TYPE_INFO[type];

  return {
    type,
    title: info.title,
    description: info.desc,
    axisScores: {
      EI: { E: counts.E, I: counts.I },
      SN: { S: counts.S, N: counts.N },
      TF: { T: counts.T, F: counts.F },
      JP: { J: counts.J, P: counts.P },
    },
  };
}

module.exports = { getQuestions, scoreMbti, TYPE_INFO };
