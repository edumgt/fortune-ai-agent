const router = require("express").Router();
const { getMbtiQuestions, scoreMbti } = require("@fortune/engine");

router.get("/questions", (_req, res) => {
  res.json({ ok: true, questions: getMbtiQuestions() });
});

router.post("/", (req, res) => {
  try {
    const { answers } = req.body || {};
    const result = scoreMbti(answers);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e?.message || e) });
  }
});

module.exports = router;
