const router = require("express").Router();
const { generateLotto } = require("@fortune/engine");

router.post("/", (req, res) => {
  try {
    const { birthDate, count } = req.body || {};
    const result = generateLotto({ birthDate, count });
    res.json({ ok: true, result });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e?.message || e) });
  }
});

module.exports = router;
