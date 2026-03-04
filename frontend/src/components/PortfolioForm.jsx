import { useState } from "react";

export default function PortfolioForm({ onSubmit }) {
  const [asset, setAsset] = useState("");
  const [type, setType] = useState("BUY");
  const [assetType, setAssetType] = useState("STOCK");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit([{ asset, type, quantity: Number(quantity), price: Number(price), assetType }]);
    // 清空表單
    setAsset("");
    setType("BUY");
    setQuantity(0);
    setPrice(0);
    setAssetType("STOCK");
  };

  return (
    <section className="portfolio-form">
      <h2>新增資產交易</h2>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>交易類型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        <div className="field-group">
          <label>資產代號</label>
          <input
            type="text"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label>資產類別</label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
          >
            <option value="STOCK">股票</option>
            <option value="BOND">債券</option>
            <option value="CRYPTO">加密貨幣</option>
            <option value="CASH">現金</option>
          </select>
        </div>

        <div className="field-group">
          <label>數量</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            step="0.0001"
            min="0.0001"
            required
          />
        </div>

        <div className="field-group">
          <label>價格（每單位 USD）</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0.1"
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          新增交易
        </button>
      </form>
    </section>
  );
}