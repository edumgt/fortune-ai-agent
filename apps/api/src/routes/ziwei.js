const router = require("express").Router();
const { calculateZiwei } = require("@fortune/engine");

router.post("/calc", (req, res) => {
  try {
    res.json({ ok: true, result: calculateZiwei(req.body) });
  } catch (error) {
    res.status(400).json({ ok: false, error: String(error?.message || error) });
  }
});

module.exports = router;
