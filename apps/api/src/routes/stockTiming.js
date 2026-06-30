const router = require("express").Router();
const path = require("path");
const { execFile } = require("child_process");

const SCRIPTS_DIR = path.join(__dirname, "..", "..", "scripts");
const TIMING_SCRIPT = path.join(SCRIPTS_DIR, "stock_timing.py");
const SEARCH_SCRIPT = path.join(SCRIPTS_DIR, "ticker_search.py");
const SYMBOL_RE = /^[A-Za-z0-9.\-=^]{1,15}$/;
const ALLOWED_PERIODS = new Set(["3mo", "6mo", "1y", "2y"]);
const ALLOWED_INTERVALS = new Set(["1h", "60m"]);

function runPythonScript(args, res) {
  execFile(
    "python3",
    args,
    { timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
    (err, stdout, stderr) => {
      if (err) {
        let msg = stderr?.trim() || err.message;
        const lines = (stderr || "").trim().split("\n");
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const parsed = JSON.parse(lines[i]);
            if (parsed?.error) {
              msg = parsed.error;
              break;
            }
          } catch {
            /* not a JSON line, keep scanning upward */
          }
        }
        return res.status(400).json({ ok: false, error: msg });
      }
      try {
        const parsed = JSON.parse(stdout);
        res.json(parsed);
      } catch {
        res.status(500).json({ ok: false, error: "분석 스크립트 응답을 파싱하지 못했습니다" });
      }
    }
  );
}

router.get("/search", (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q || q.length > 40) {
    return res.status(400).json({ ok: false, error: "유효한 검색어(q)가 필요합니다 (1~40자)" });
  }
  runPythonScript([SEARCH_SCRIPT, q, "--max", "8"], res);
});

router.get("/", (req, res) => {
  const symbol = String(req.query.symbol || "").trim();
  const period = String(req.query.period || "1y");
  const interval = String(req.query.interval || "1h");

  if (!SYMBOL_RE.test(symbol)) {
    return res.status(400).json({ ok: false, error: "유효한 symbol 파라미터가 필요합니다 (예: AAPL, 005930.KS)" });
  }
  if (!ALLOWED_PERIODS.has(period)) {
    return res.status(400).json({ ok: false, error: `period는 ${[...ALLOWED_PERIODS].join(", ")} 중 하나여야 합니다` });
  }
  if (!ALLOWED_INTERVALS.has(interval)) {
    return res.status(400).json({ ok: false, error: `interval은 ${[...ALLOWED_INTERVALS].join(", ")} 중 하나여야 합니다` });
  }

  runPythonScript([TIMING_SCRIPT, symbol, "--period", period, "--interval", interval], res);
});

module.exports = router;
