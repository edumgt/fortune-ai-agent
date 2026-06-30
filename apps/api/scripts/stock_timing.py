#!/usr/bin/env python3
"""
yfinance 기반 시간대별 주가 흐름 분석
- 장 시작(오전) / 점심시간(장중) / 마감(오후) 구간의 일별 수익률을 집계하여
  어느 시간대에 주로 상승하는지 분석한다.

Yahoo Finance 분봉 데이터 제약 및 설계 결정:
- 1시간(1h) 봉은 최대 약 730일까지 제공되어 "최근 1년" 요구사항을 충족할 수 있는
  최선의 분 단위 데이터다. 30m/15m/5m 이하 분봉은 최근 60일로 제한되어 1년 분석에는
  사용할 수 없다.
- 거래소마다 1시간봉의 시작 시각 그리드가 다르다(예: 미국 09:30/10:30/...,
  한국 09:00/10:00/...). 따라서 고정된 시·분 범위로 봉을 매칭하면 일부 거래소에서
  구간이 비어버린다. 대신 "그날의 첫 봉 = 장 시작", "그날의 마지막 봉 = 장 마감",
  "그날의 가운데 봉 = 점심시간"으로 거래일 상대 위치 기준으로 구간을 정의해
  거래소별 그리드 차이에 강건하게 만든다.
"""
import sys
import json
import argparse

import yfinance as yf

WINDOW_LABELS = {
    "morning": "장 초반(당일 첫 시간봉, 09시대 시가 부근)",
    "lunch": "점심시간(당일 중간 시간봉, 장중 11~13시대 부근)",
    "close": "마감 무렵(당일 마지막 시간봉, 종가 직전 부근)",
}

MIN_BARS_FOR_LUNCH = 3


def bar_return(row):
    open_price = float(row["Open"])
    close_price = float(row["Close"])
    if open_price == 0:
        return None
    return (close_price - open_price) / open_price * 100.0


def day_window_returns(rows):
    """하루치 시간봉(rows, 시간순 정렬)에서 morning/lunch/close 구간 수익률을 계산"""
    n = len(rows)
    out = {"morning": None, "lunch": None, "close": None}
    if n == 0:
        return out

    out["morning"] = bar_return(rows.iloc[0])
    out["close"] = bar_return(rows.iloc[-1])
    if n >= MIN_BARS_FOR_LUNCH:
        mid_idx = n // 2
        out["lunch"] = bar_return(rows.iloc[mid_idx])
    return out


def analyze(symbol, period, interval):
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)
    if df.empty:
        raise RuntimeError(f"'{symbol}' 데이터를 가져오지 못했습니다. 티커를 확인하세요.")

    df = df.reset_index()
    dt_col = "Datetime" if "Datetime" in df.columns else "Date"
    df["d"] = df[dt_col].dt.date

    per_window_returns = {key: [] for key in WINDOW_LABELS}
    days_analyzed = 0

    for _day, rows in df.groupby("d"):
        rows = rows.sort_values(dt_col)
        days_analyzed += 1
        window_returns = day_window_returns(rows)
        for key, value in window_returns.items():
            if value is not None:
                per_window_returns[key].append(value)

    summary = {}
    for key, label in WINDOW_LABELS.items():
        values = per_window_returns[key]
        n = len(values)
        up = sum(1 for v in values if v > 0)
        down = sum(1 for v in values if v < 0)
        flat = n - up - down
        avg = sum(values) / n if n else None
        summary[key] = {
            "label": label,
            "sampleDays": n,
            "upDays": up,
            "downDays": down,
            "flatDays": flat,
            "winRate": round(up / n * 100, 2) if n else None,
            "avgReturnPct": round(avg, 4) if avg is not None else None,
        }

    ranked = sorted(
        (k for k in summary if summary[k]["avgReturnPct"] is not None),
        key=lambda k: summary[k]["avgReturnPct"],
        reverse=True,
    )
    best = ranked[0] if ranked else None
    worst = ranked[-1] if ranked else None

    return {
        "symbol": symbol.upper(),
        "period": period,
        "interval": interval,
        "exchangeTimezone": str(getattr(ticker.fast_info, "timezone", "")) if hasattr(ticker, "fast_info") else None,
        "dataRange": {
            "from": str(df[dt_col].min()),
            "to": str(df[dt_col].max()),
        },
        "tradingDaysAnalyzed": days_analyzed,
        "windows": summary,
        "bestWindow": best,
        "worstWindow": worst,
        "note": (
            "Yahoo Finance의 분봉 데이터 제공 제약상 1시간봉(최대 약 730일)을 사용했습니다. "
            "거래소별 시간봉 시작 시각 그리드가 달라(예: 미국 09:30 시작, 한국 09:00 시작) "
            "각 거래일의 첫/가운데/마지막 시간봉을 장초반/점심시간/마감 구간으로 근사했습니다. "
            "분 단위 정밀도(예: 30분봉 이하)는 최근 60일로만 제공되어 1년 분석에는 사용할 수 없습니다."
        ),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("symbol")
    parser.add_argument("--period", default="1y")
    parser.add_argument("--interval", default="1h")
    args = parser.parse_args()

    try:
        result = analyze(args.symbol, args.period, args.interval)
        print(json.dumps({"ok": True, "result": result}, ensure_ascii=False, default=str))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
