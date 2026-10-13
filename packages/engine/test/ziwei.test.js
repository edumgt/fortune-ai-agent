const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateZiwei } = require("../src");

const birth = { year: 1990, month: 1, day: 1, hour: 9, minute: 0, gender: "M" };

test("12궁 명반과 주요 풀이를 한국어로 반환한다", () => {
  const result = calculateZiwei(birth);
  assert.equal(result.palaces.length, 12);
  assert.equal(new Set(result.palaces.map((palace) => palace.index)).size, 12);
  assert.equal(result.solarDate, "1990-1-1");
  assert.equal(result.lunarDate, "음력 1989년 12월 5일");
  assert.deepEqual(result.palaces.find((palace) => palace.name === "명궁").majorStars.map((star) => star.name), ["무곡", "천상"]);
  assert.deepEqual(result.reading.map((area) => area.label), ["성향", "관계", "재물", "일"]);
});

test("같은 양력·음력 생일은 같은 명반을 만든다", () => {
  const solar = calculateZiwei(birth);
  const lunar = calculateZiwei({ year: 1989, month: 12, day: 5, hour: 9, gender: "M", calendarType: "lunar" });
  assert.equal(lunar.solarDate, solar.solarDate);
  assert.deepEqual(lunar.palaces, solar.palaces);
});

test("윤달과 야자시를 구분한다", () => {
  const regular = calculateZiwei({ year: 2023, month: 2, day: 1, hour: 23, gender: "F", calendarType: "lunar" });
  const leap = calculateZiwei({ year: 2023, month: 2, day: 1, hour: 23, gender: "F", calendarType: "lunar", isLeapMonth: true });
  assert.equal(regular.solarDate, "2023-2-20");
  assert.equal(leap.solarDate, "2023-3-22");
  assert.equal(leap.input.timeIndex, 12);
  assert.equal(calculateZiwei({ ...birth, hour: 0 }).input.timeIndex, 0);
});

test("잘못된 출생 정보는 거부한다", () => {
  assert.throws(() => calculateZiwei({ ...birth, month: 2, day: 31 }), /유효하지 않은 양력 날짜/);
  assert.throws(() => calculateZiwei({ ...birth, hour: 24 }), /시는/);
  assert.throws(() => calculateZiwei({ ...birth, gender: "X" }), /성별/);
  assert.throws(() => calculateZiwei({ ...birth, isLeapMonth: true }), /윤달은 음력/);
});
