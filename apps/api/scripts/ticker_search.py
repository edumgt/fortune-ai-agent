#!/usr/bin/env python3
"""
종목명/티커 검색
- Yahoo Finance의 검색 API(yfinance Search)는 한글 질의를 지원하지 않으므로,
  국내 주요 종목은 로컬 매핑 테이블에서 한글 회사명으로 우선 매칭한다.
- 영문/숫자 질의(티커, 해외 종목명 등)는 yfinance Search로 보완한다.
- 두 결과를 합쳐 심볼 기준으로 중복 제거 후 상위 N개를 반환한다.

주의: KR_COMPANIES는 자주 거래되는 국내 상장사 위주의 참고용 목록이며,
상장폐지/사명변경/신규상장 등으로 실제와 다를 수 있다(데모 목적).
"""
import sys
import json
import argparse
import re

import yfinance as yf

KR_COMPANIES = [
    ("삼성전자", "005930.KS"), ("삼성전자우", "005935.KS"), ("SK하이닉스", "000660.KS"),
    ("LG에너지솔루션", "373220.KS"), ("삼성바이오로직스", "207940.KS"), ("현대차", "005380.KS"),
    ("기아", "000270.KS"), ("셀트리온", "068270.KS"), ("POSCO홀딩스", "005490.KS"),
    ("포스코홀딩스", "005490.KS"), ("네이버", "035420.KS"), ("NAVER", "035420.KS"),
    ("삼성SDI", "006400.KS"), ("LG화학", "051910.KS"), ("KB금융", "105560.KS"),
    ("신한지주", "055550.KS"), ("현대모비스", "012330.KS"), ("삼성물산", "028260.KS"),
    ("SK이노베이션", "096770.KS"), ("LG전자", "066570.KS"), ("하나금융지주", "086790.KS"),
    ("카카오", "035720.KS"), ("삼성생명", "032830.KS"), ("SK텔레콤", "017670.KS"),
    ("한국전력", "015760.KS"), ("우리금융지주", "316140.KS"), ("LG생활건강", "051900.KS"),
    ("메리츠금융지주", "138040.KS"), ("삼성화재", "000810.KS"), ("SK", "034730.KS"),
    ("한화솔루션", "009830.KS"), ("두산에너빌리티", "034020.KS"), ("KT&G", "033780.KS"),
    ("케이티앤지", "033780.KS"), ("현대글로비스", "086280.KS"), ("기업은행", "024110.KS"),
    ("SK스퀘어", "402340.KS"), ("한미반도체", "042700.KS"), ("LG", "003550.KS"),
    ("아모레퍼시픽", "090430.KS"), ("현대제철", "004020.KS"), ("한국조선해양", "009540.KS"),
    ("코웨이", "021240.KS"), ("롯데케미칼", "011170.KS"), ("GS", "078930.KS"),
    ("DB손해보험", "005830.KS"), ("삼성에스디에스", "018260.KS"), ("삼성SDS", "018260.KS"),
    ("HMM", "011200.KS"), ("두산밥캣", "241560.KS"), ("한화에어로스페이스", "012450.KS"),
    ("현대건설", "000720.KS"), ("종근당", "185750.KS"), ("유한양행", "000100.KS"),
    ("농심", "004370.KS"), ("CJ제일제당", "097950.KS"), ("KT", "030200.KS"),
    ("LG디스플레이", "034220.KS"), ("LG유플러스", "032640.KS"), ("이마트", "139480.KS"),
    ("쿠팡", "CPNG"),
    ("에코프로비엠", "247540.KQ"), ("에코프로", "086520.KQ"), ("카카오게임즈", "293490.KQ"),
    ("펄어비스", "263750.KQ"), ("알테오젠", "196170.KQ"), ("HLB", "028300.KQ"),
    ("리노공업", "058470.KQ"), ("클래시스", "214150.KQ"), ("엘앤에프", "066970.KQ"),
    ("휴젤", "145020.KQ"), ("JYP Ent", "035900.KQ"), ("JYP엔터테인먼트", "035900.KQ"),
    ("에스엠", "041510.KQ"), ("SM엔터테인먼트", "041510.KQ"),
    ("와이지엔터테인먼트", "122870.KQ"), ("YG엔터테인먼트", "122870.KQ"),
]


def search_local(query):
    q = query.strip()
    if not q:
        return []
    results = []
    for name, symbol in KR_COMPANIES:
        if q in name or name in q:
            results.append({"symbol": symbol, "name": name, "exchange": "KRX", "source": "local"})
    return results


def has_hangul(s):
    return bool(re.search(r"[가-힣]", s))


def search_yahoo(query, max_results):
    try:
        s = yf.Search(query, max_results=max_results)
        out = []
        for q in s.quotes:
            symbol = q.get("symbol")
            if not symbol:
                continue
            name = q.get("shortname") or q.get("longname") or symbol
            out.append({"symbol": symbol, "name": name, "exchange": q.get("exchange", ""), "source": "yahoo"})
        return out
    except Exception:
        return []


def search(query, max_results):
    local = search_local(query)
    yahoo = [] if has_hangul(query) else search_yahoo(query, max_results)

    merged = []
    seen = set()
    for item in local + yahoo:
        if item["symbol"] in seen:
            continue
        seen.add(item["symbol"])
        merged.append(item)
        if len(merged) >= max_results:
            break
    return merged


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("--max", type=int, default=8)
    args = parser.parse_args()

    try:
        results = search(args.query, args.max)
        print(json.dumps({"ok": True, "result": {"query": args.query, "results": results}}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
