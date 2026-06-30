const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const sajuRoutes = require("./routes/saju");
const gunghapRoutes = require("./routes/gunghap");
const authRoutes = require("./routes/auth");
const pushRoutes = require("./routes/push");
const dailyRoutes = require("./routes/daily");
const biorhythmRoutes = require("./routes/biorhythm");
const mbtiRoutes = require("./routes/mbti");
const investmentRoutes = require("./routes/investment");
const lottoRoutes = require("./routes/lotto");
const stockTimingRoutes = require("./routes/stockTiming");
const { seedTestAccounts } = require("./lib/users");

const app = express();
app.use(helmet());
app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/saju", sajuRoutes);
app.use("/api/gunghap", gunghapRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/biorhythm", biorhythmRoutes);
app.use("/api/mbti", mbtiRoutes);
app.use("/api/investment", investmentRoutes);
app.use("/api/lotto", lottoRoutes);
app.use("/api/stock-timing", stockTimingRoutes);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`API listening on :${port}`);
  await seedTestAccounts();
});
