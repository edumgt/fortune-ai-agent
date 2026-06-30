/**
 * 바이오리듬 계산
 * - 신체(23일)/감정(28일)/지성(33일) 주기를 출생일 기준 사인파로 계산
 */
const CYCLES = {
  physical: { days: 23, ko: "신체", emoji: "💪" },
  emotional: { days: 28, ko: "감정", emoji: "❤️" },
  intellectual: { days: 33, ko: "지성", emoji: "🧠" },
};

function toUTCDate({ year, month, day }) {
  return new Date(Date.UTC(year, month - 1, day));
}

function daysBetween(from, to) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

function waveValue(daysSinceBirth, periodDays) {
  return Math.sin((2 * Math.PI * daysSinceBirth) / periodDays);
}

function levelOf(value) {
  if (value >= 0.5) return { level: "high", levelKo: "최고조" };
  if (value > 0) return { level: "rising", levelKo: "상승" };
  if (value > -0.5) return { level: "falling", levelKo: "하강" };
  return { level: "low", levelKo: "최저조" };
}

function isCriticalDay(value) {
  return Math.abs(value) < 0.05;
}

function calcBiorhythm({ birthDate, targetDate, rangeDays = 7 }) {
  if (!birthDate?.year || !birthDate?.month || !birthDate?.day) {
    throw new Error("birthDate { year, month, day } is required");
  }
  const birth = toUTCDate(birthDate);
  const target = targetDate?.year
    ? toUTCDate(targetDate)
    : toUTCDate({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
      });

  const daysSinceBirth = daysBetween(birth, target);
  if (daysSinceBirth < 0) throw new Error("targetDate must be on/after birthDate");

  const cycles = {};
  for (const [key, cfg] of Object.entries(CYCLES)) {
    const raw = waveValue(daysSinceBirth, cfg.days);
    const percent = Math.round(raw * 100);
    cycles[key] = {
      ko: cfg.ko,
      emoji: cfg.emoji,
      periodDays: cfg.days,
      value: percent,
      ...levelOf(raw),
      critical: isCriticalDay(raw),
    };
  }

  const average = Math.round(
    (cycles.physical.value + cycles.emotional.value + cycles.intellectual.value) / 3
  );

  const series = [];
  for (let offset = -rangeDays; offset <= rangeDays; offset++) {
    const d = daysSinceBirth + offset;
    const point = {
      offset,
      date: new Date(target.getTime() + offset * 86400000).toISOString().slice(0, 10),
      physical: Math.round(waveValue(d, CYCLES.physical.days) * 100),
      emotional: Math.round(waveValue(d, CYCLES.emotional.days) * 100),
      intellectual: Math.round(waveValue(d, CYCLES.intellectual.days) * 100),
    };
    series.push(point);
  }

  return {
    daysSinceBirth,
    targetDate: target.toISOString().slice(0, 10),
    cycles,
    average,
    series,
  };
}

module.exports = { calcBiorhythm };
