const express = require("express");
const pool = require('./db/db');
const { processTransaction } = require("./engine/portfolioEngine")
const {find_real_price} = require("./engine/find_real_price");
const app = express()
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Portfolio Tracker API Running")
})
app.put("/price", async (req, res) => {
  let update = 0;
  try{
    const dbResult = await pool.query("SELECT asset, asset_type, real_price FROM portfolio");
    await pool.query("BEGIN");
    for (const row of dbResult.rows){
      const price = await find_real_price(row.asset, row.asset_type, row.real_price);
      await pool.query(
        "UPDATE portfolio SET real_price = $1 WHERE asset = $2",
        [Number(price), row.asset]
      );
    }
    await pool.query("COMMIT");
    return res.json({ok: true});
  } catch(err){
      await pool.query("ROLLBACK");
      console.error("[update-price] fail:", err);
      return res.status(500).send("價格更新失敗");
  }
});
app.get("/portfolio", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM portfolio ORDER BY asset ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

app.post("/portfolio", async (req, res) => {
  const transactions = req.body.transactions

  try{
    const dbResult = await pool.query("SELECT * FROM portfolio");
    let result = {};
    for (const row of dbResult.rows) {
      result[row.asset] = {
        assetType: row.asset_type,
        quantity: Number(row.quantity),
        totalCost: Number(row.total_cost),
        averagePrice: Number(row.avg_cost),
        real_price: Number(row.real_price)
      };
    }

    result = await processTransaction(transactions,result);
    for (const asset in result) {
      const r = result[asset];
      await pool.query(
        `INSERT INTO portfolio (asset, asset_type, quantity, avg_cost, total_cost, real_price)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (asset) DO UPDATE
         SET asset_type = EXCLUDED.asset_type,
             quantity = EXCLUDED.quantity,
             avg_cost = EXCLUDED.avg_cost,
             total_cost = EXCLUDED.total_cost,
             real_price = EXCLUDED.real_price`,
        [asset, r.assetType, Number(r.quantity), Number(r.averagePrice), Number(r.totalCost), Number(r.real_price)]
      );
    }
    res.json(result)
    
  } catch(err){
    console.error(err);
    res.status(500).send("server error");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000")
})