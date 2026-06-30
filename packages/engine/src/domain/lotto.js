/**
 * 로또번호 추천
 * - 생년월일이 주어지면 "오늘의 행운번호"(생년월일+오늘 날짜로 시드, 하루 동안 고정) 1세트 생성
 * - 나머지는 완전 무작위 세트로 생성
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromBirthDate(birthDate, dateKey) {
  const { year, month, day } = birthDate;
  const str = `${year}${month}${day}-${dateKey}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function drawSet(rng) {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const picked = [];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.sort((a, b) => a - b);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function generateLotto({ birthDate, count = 5 } = {}) {
  const n = Math.min(Math.max(Number(count) || 5, 1), 5);
  const games = [];

  if (birthDate?.year && birthDate?.month && birthDate?.day) {
    const luckyRng = mulberry32(seedFromBirthDate(birthDate, todayKey()));
    games.push({ label: "오늘의 행운번호", numbers: drawSet(luckyRng) });
  }

  let randomIndex = 1;
  while (games.length < n) {
    const rng = mulberry32((Math.random() * 0xffffffff) >>> 0);
    games.push({ label: `랜덤 추천 ${randomIndex++}`, numbers: drawSet(rng) });
  }

  return { generatedAt: new Date().toISOString(), games };
}

module.exports = { generateLotto };
