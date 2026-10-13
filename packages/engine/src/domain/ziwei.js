const { astro } = require("iztro");

const STAR_TRAITS = {
  자미: "지도력과 조율",
  천기: "사고와 계획",
  태양: "개방성과 책임",
  무곡: "실행력과 자원 관리",
  천동: "유연함과 공감",
  염정: "원칙과 관계 감각",
  천부: "안정과 관리",
  태음: "섬세함과 축적",
  탐랑: "호기심과 사교성",
  거문: "언어와 분석",
  천상: "균형과 중재",
  천량: "보호와 원칙",
  칠살: "결단과 도전",
  파군: "변화와 개척",
};

const READING_AREAS = [
  { palace: "명궁", label: "성향", focus: "기본 성향을" },
  { palace: "부처", label: "관계", focus: "가까운 관계를" },
  { palace: "재백", label: "재물", focus: "자원을 다루는 방식을" },
  { palace: "관록", label: "일", focus: "일과 역할을" },
];

function requireInteger(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label}${label === "시" ? "는" : "은"} ${min}~${max} 사이의 정수여야 합니다.`);
  }
}

function validateInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("출생 정보를 입력해 주세요.");
  }
  const { year, month, day, hour, minute = 0, gender, calendarType = "solar", isLeapMonth = false } = input;
  requireInteger(year, "생년", 1, 9999);
  requireInteger(month, "월", 1, 12);
  requireInteger(day, "일", 1, 31);
  requireInteger(hour, "시", 0, 23);
  requireInteger(minute, "분", 0, 59);
  if (!(["M", "F"].includes(gender))) throw new Error("성별은 M 또는 F여야 합니다.");
  if (!(["solar", "lunar"].includes(calendarType))) throw new Error("달력은 solar 또는 lunar여야 합니다.");
  if (typeof isLeapMonth !== "boolean") throw new Error("윤달 여부는 참/거짓으로 입력해 주세요.");
  if (calendarType === "solar" && isLeapMonth) throw new Error("윤달은 음력 날짜에서만 선택할 수 있습니다.");

  return { year, month, day, hour, minute, gender, calendarType, isLeapMonth };
}

function simplifyStar(star) {
  return {
    name: star.name,
    ...(star.mutagen ? { mutagen: star.mutagen } : {}),
  };
}

function summarizeArea(palaces, { palace, label, focus }) {
  const target = palaces.find((item) => item.name === palace);
  const stars = target?.majorStars || [];
  return {
    label,
    palace: target?.name || palace,
    stars: stars.map((star) => star.name),
    text: stars.length
      ? `주성 ${stars.map((star) => `${star.name}(${STAR_TRAITS[star.name] || "고유한 성향"})`).join("·")}의 상징을 통해 ${focus} 살펴볼 수 있습니다.`
      : `이 궁에는 주성이 없습니다. ${focus} 살펴볼 때 맞은편 궁과 다른 별의 조합도 함께 살펴보세요.`,
  };
}

function calculateZiwei(rawInput) {
  const input = validateInput(rawInput);
  // 00:00~00:59 = 조자시(0), 01:00~02:59 = 축시(1), ...,
  // 21:00~22:59 = 해시(11), 23:00~23:59 = 야자시(12).
  const timeIndex = input.hour === 23 ? 12 : Math.floor((input.hour + 1) / 2);
  const dateStr = `${input.year}-${input.month}-${input.day}`;
  const gender = input.gender === "M" ? "male" : "female";
  let chart;
  try {
    chart = input.calendarType === "lunar"
      ? astro.byLunar(dateStr, timeIndex, gender, input.isLeapMonth, true, "ko-KR")
      : astro.bySolar(dateStr, timeIndex, gender, true, "ko-KR");
  } catch {
    throw new Error(`유효하지 않은 ${input.calendarType === "lunar" ? "음력" : "양력"} 날짜입니다. 날짜와 윤달 여부를 확인해 주세요.`);
  }

  const palaces = chart.palaces.map((palace) => ({
    index: palace.index,
    name: palace.name,
    heavenlyStem: palace.heavenlyStem,
    earthlyBranch: palace.earthlyBranch,
    isBodyPalace: palace.isBodyPalace,
    majorStars: palace.majorStars.map(simplifyStar),
    minorStars: palace.minorStars.map(simplifyStar),
    adjectiveStars: palace.adjectiveStars.map(simplifyStar),
    decadalRange: palace.decadal?.range || null,
  }));

  return {
    input: { ...input, timeIndex },
    solarDate: chart.solarDate,
    lunarDate: chart.lunarDate,
    time: chart.time,
    timeRange: chart.timeRange,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
    bodyPalaceBranch: chart.earthlyBranchOfBodyPalace,
    palaces,
    reading: READING_AREAS.map((area) => summarizeArea(palaces, area)),
    meta: {
      calculationLibrary: "iztro",
      language: "ko-KR",
      fixLeap: true,
      timeBasis: "입력한 출생 시각(경도·진태양시 보정 없음)",
    },
  };
}

module.exports = { calculateZiwei };
