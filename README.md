# PortfolioLens
Investment Tracker
PortfolioLens 是一個投資組合追蹤工具，支援股票、加密貨幣與現金部位管理。
系統會記錄交易、計算持有成本與均價，並可透過 Yahoo Finance 更新市場價格，讓你快速掌握投組分布與損益狀況。

## 專案架構

- Frontend: React
- Backend: Node.js + Express
- Database: PostgreSQL
- Market Data: Yahoo Finance

## 目錄結構

```text
PortfolioLens/
├─ backend/
│  ├─ app.js
│  ├─ db/db.js
│  └─ engine/
│     ├─ portfolioEngine.js
│     └─ find_real_price.js
├─ frontend/
│  └─ src/
│     ├─ App.js
│     └─ components/
│        ├─ PortfolioForm.jsx
│        └─ PortfolioChart.jsx
├─ schema.sql
└─ test/
```

## 功能重點

- 新增交易（BUY / SELL）
- 支援資產類型：STOCK、CRYPTO、CASH
- 自動計算：
  - 持有數量
  - 持有總成本
  - 平均成本
- 從 Yahoo Finance 刷新市場價格
- 顯示投資組合分布與損益資訊


## API 說明

### GET /

檢查後端。

- Response: `Portfolio Tracker API Running`

### GET /portfolio

讀取目前投資組合資料。

- Response: `Array<PortfolioRow>`

### POST /portfolio

送出交易並更新投資組合。
Example
Request body：

```json
{
  "transactions": [
    {
      "asset": "AAPL",
      "type": "BUY",
      "quantity": 10,
      "price": 150,
      "assetType": "STOCK"
    }
  ]
}
```

### PUT /price

刷新所有資產的市場價格並儲存至資料庫（`real_price`）。

- Response: `{ "ok": true }`

## 資料庫設計

| 欄位 | 型別 | 說明 |
|---|---|---|
| asset | varchar(20) | 資產代號（主鍵） |
| asset_type | varchar(20) | 資產類別：STOCK/CRYPTO/CASH |
| quantity | numeric(20,8) | 持有數量 |
| avg_cost | numeric(12,4) | 平均成本 |
| total_cost | numeric(14,4) | 總成本 |
| real_price | numeric(12,4) | 市價 |


## 注意事項
- 非英文字首的股票代號會以台股代號規則查詢（例如 `0050.TW`）。
- 價格欄位依 Yahoo Finance 回傳值而定，若查無即回退到輸入價格。

## 後續可改進方向
- 定時自動刷新價格
- 多使用者登入與授權
- 雲端部署（Docker / CI-CD）
