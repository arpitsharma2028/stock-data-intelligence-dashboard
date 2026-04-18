from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse, FileResponse
import pandas as pd
import numpy as np
from datetime import timedelta
import os
from .services import (
    COMPANIES, MOCK_SYMBOLS, ensure_data, load_from_db, fetch_and_store
)
from .database import get_db

router = APIRouter()

@router.get("/", response_class=HTMLResponse, include_in_schema=False)
def root():
    # Since we are running from stock_dashboard/, static/ is in the root
    return FileResponse("static/index.html")

@router.get("/companies", tags=["Data"])
def get_companies():
    """Returns a list of all available companies."""
    return {
        "count": len(COMPANIES),
        "companies": [
            {"symbol": sym, **info}
            for sym, info in COMPANIES.items()
        ]
    }

@router.get("/data/{symbol}", tags=["Data"])
def get_stock_data(symbol: str, days: int = Query(30, ge=1, le=365)):
    """
    Returns last N days of stock data for the given symbol.
    - Fetches from yfinance if not cached in DB.
    - Includes open, high, low, close, volume, daily_return, 7-day MA.
    """
    symbol = symbol.upper()
    ensure_data(symbol)
    rows = load_from_db(symbol, days=days)
    if not rows:
        raise HTTPException(status_code=404, detail="No data found for given range.")
    
    data_source = "mock" if symbol in MOCK_SYMBOLS else "yfinance"
    return {"symbol": symbol, "days": days, "count": len(rows), "data_source": data_source, "data": rows}

@router.get("/summary/{symbol}", tags=["Data"])
def get_summary(symbol: str):
    """
    Returns 52-week high, low, average close, volatility score,
    and top 3 best/worst trading days.
    """
    symbol = symbol.upper()
    ensure_data(symbol)
    rows = load_from_db(symbol, days=365)

    if not rows:
        raise HTTPException(status_code=404, detail="No data available.")

    df_52w = pd.DataFrame(rows)
    df_52w["date"] = pd.to_datetime(df_52w["date"])

    # Volatility score: std of daily returns (annualised)
    volatility = round(float(df_52w["daily_return"].std() * np.sqrt(252)), 2) if len(df_52w) > 1 else 0

    # Top gainers / losers
    top3_best  = df_52w.nlargest(3, "daily_return")[["date", "close", "daily_return"]].copy()
    top3_worst = df_52w.nsmallest(3, "daily_return")[["date", "close", "daily_return"]].copy()
    top3_best["date"]  = top3_best["date"].astype(str)
    top3_worst["date"] = top3_worst["date"].astype(str)

    data_source = "mock" if symbol in MOCK_SYMBOLS else "yfinance"

    return {
        "symbol": symbol,
        "name": COMPANIES[symbol]["name"],
        "sector": COMPANIES[symbol]["sector"],
        "data_source": data_source,
        "52_week_high": round(float(df_52w["high"].max()), 2) if not df_52w.empty else None,
        "52_week_low":  round(float(df_52w["low"].min()), 2)  if not df_52w.empty else None,
        "avg_close":    round(float(df_52w["close"].mean()), 2) if not df_52w.empty else None,
        "volatility_score": volatility,
        "top_3_best_days":  top3_best.to_dict("records"),
        "top_3_worst_days": top3_worst.to_dict("records"),
    }

@router.get("/forecast/{symbol}", tags=["Data"])
def get_forecast(symbol: str, days: int = Query(14, ge=7, le=30)):
    """
    Generate a Monte Carlo simulation forecast (Geometric Brownian Motion)
    Returns upper bound, median, and lower bound for the shaded probability cone.
    """
    symbol = symbol.upper()
    ensure_data(symbol)
    
    rows = load_from_db(symbol, days=60) # Use 60 days to calc historical volatility
    if len(rows) < 10:
        raise HTTPException(status_code=400, detail="Not enough historical data for forecast.")
        
    df = pd.DataFrame(rows)
    closes = df["close"].values
    
    returns = np.diff(closes) / closes[:-1]
    mu = np.mean(returns)
    sigma = np.std(returns)
    
    last_price = closes[-1]
    last_date = pd.to_datetime(df["date"].iloc[-1])
    
    num_simulations = 100
    simulations = []
    
    for _ in range(num_simulations):
        prices = [last_price]
        for _ in range(days):
            epsilon = np.random.normal(0, 1)
            # Geometric Brownian Motion
            price = prices[-1] * np.exp((mu - (sigma**2)/2) + sigma * epsilon)
            prices.append(price)
        simulations.append(prices)
        
    simulations = np.array(simulations)
    
    upper_bound = np.percentile(simulations, 95, axis=0)
    median_path = np.percentile(simulations, 50, axis=0)
    lower_bound = np.percentile(simulations, 5, axis=0)
    
    future_dates = [last_date.strftime("%Y-%m-%d")]
    current_date = last_date + pd.Timedelta(days=1)
    while len(future_dates) < days + 1:
        if current_date.weekday() < 5:
            future_dates.append(current_date.strftime("%Y-%m-%d"))
        current_date += pd.Timedelta(days=1)
        
    return {
        "symbol": symbol,
        "dates": future_dates,
        "upper": [round(float(p), 2) for p in upper_bound],
        "median": [round(float(p), 2) for p in median_path],
        "lower": [round(float(p), 2) for p in lower_bound]
    }

@router.get("/compare", tags=["Data"])
def compare_stocks(
    symbol1: str = Query(..., description="First stock symbol"),
    symbol2: str = Query(..., description="Second stock symbol"),
    days: int = Query(30, ge=7, le=365),
):
    """
    Compare two stocks' closing price performance over N days.
    Returns normalised performance (base 100) so different-priced stocks
    are easy to compare.
    """
    s1, s2 = symbol1.upper(), symbol2.upper()
    ensure_data(s1)
    ensure_data(s2)

    d1 = pd.DataFrame(load_from_db(s1, days=days)).set_index("date")
    d2 = pd.DataFrame(load_from_db(s2, days=days)).set_index("date")

    if d1.empty or d2.empty:
        raise HTTPException(status_code=404, detail="Insufficient data for comparison.")

    # Correlation of daily returns
    merged = d1[["daily_return"]].join(d2[["daily_return"]], lsuffix="_s1", rsuffix="_s2", how="inner")
    corr = round(float(merged["daily_return_s1"].corr(merged["daily_return_s2"])), 4)

    # Normalise to 100
    def normalise(df):
        first = df["close"].iloc[0]
        return (df["close"] / first * 100).round(2).tolist()

    dates = sorted(set(d1.index) & set(d2.index))

    return {
        "symbol1": s1,
        "symbol2": s2,
        "days": days,
        "correlation": corr,
        "dates": dates,
        f"{s1}_normalised": normalise(d1.loc[d1.index.isin(dates)]),
        f"{s2}_normalised": normalise(d2.loc[d2.index.isin(dates)]),
        f"{s1}_return_pct": round(float((d1["close"].iloc[-1] / d1["close"].iloc[0] - 1) * 100), 2),
        f"{s2}_return_pct": round(float((d2["close"].iloc[-1] / d2["close"].iloc[0] - 1) * 100), 2),
    }

@router.post("/refresh/{symbol}", tags=["Admin"])
def refresh_data(symbol: str):
    """Force re-download latest data for a symbol from yfinance."""
    symbol = symbol.upper()
    if symbol not in COMPANIES:
        raise HTTPException(status_code=404, detail=f"Symbol '{symbol}' not supported.")
    try:
        n = fetch_and_store(symbol)
        return {"message": f"Refreshed {n} rows for {symbol}"}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/gainers-losers", tags=["Data"])
def top_gainers_losers():
    """
    Returns today's (or latest available) top 3 gainers and losers
    among all tracked companies.
    """
    results = []
    conn = get_db()
    for symbol in COMPANIES:
        row = conn.execute("""
            SELECT symbol, date, close, daily_return
            FROM stock_data WHERE symbol = ?
            ORDER BY date DESC LIMIT 1
        """, (symbol,)).fetchone()
        if row:
            results.append(dict(row))
    conn.close()

    if not results:
        return {"message": "No data loaded yet. Call /refresh/{symbol} first."}

    df = pd.DataFrame(results).sort_values("daily_return", ascending=False)
    return {
        "top_3_gainers": df.head(3).to_dict("records"),
        "top_3_losers":  df.tail(3).to_dict("records"),
    }
