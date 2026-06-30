const router = require("express").Router();
const { calcBiorhythm } = require("@fortune/engine");

router.post("/", (req, res) => {
  try {
    const { birthDate, targetDate, rangeDays } = req.body || {};
    const result = calcBiorhythm({ birthDate, targetDate, rangeDays });
    res.json({ ok: true, result });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e?.message || e) });
  }
});

module.exports = router;
