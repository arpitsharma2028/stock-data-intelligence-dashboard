import sqlite3
import os

# Database should be placed in the stock_dashboard root directory
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "stocks.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS stock_data (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol      TEXT NOT NULL,
            date        TEXT NOT NULL,
            open        REAL,
            high        REAL,
            low         REAL,
            close       REAL,
            volume      INTEGER,
            daily_return REAL,
            ma7         REAL,
            UNIQUE(symbol, date)
        )
    """)
    conn.commit()
    conn.close()
