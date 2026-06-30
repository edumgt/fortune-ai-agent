const router = require("express").Router();
const { getInvestmentQuestions, scoreInvestment } = require("@fortune/engine");

router.get("/questions", (_req, res) => {
  res.json({ ok: true, questions: getInvestmentQuestions() });
});

router.post("/", (req, res) => {
  try {
    const { answers, personalInfo } = req.body || {};
    const result = scoreInvestment({ answers, personalInfo });
    res.json({ ok: true, result });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e?.message || e) });
  }
});

module.exports = router;
