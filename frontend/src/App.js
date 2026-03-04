import { useEffect, useState } from "react";
import PortfolioForm from "./components/PortfolioForm";
import PortfolioChart from "./components/PortfolioChart";
import "./App.css";

function App() {
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [updatingPrice, setUpdatingPrice] = useState(false);

  const fetchPortfolio = async () => {
    setLoadingAssets(true);
    try {
      const res = await fetch("/portfolio");
      if (!res.ok) {
        throw new Error("讀取資產失敗");
      }
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubmitStatus({ type: "error", message: error.message || "讀取資產失敗" });
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleSubmit = async (transactions) => {
    try {
      const res = await fetch("/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });

      if (!res.ok) {
        throw new Error("輸入有誤，請檢查輸入");
      }

      const data = await res.json();
      setSubmitStatus({ type: "success", message: "交易新增成功" });
      console.log(data);
      fetchPortfolio();
    } catch (error) {
      setSubmitStatus({ type: "error", message: error.message || "送出失敗" });
    }
  };

  const handleRefreshPrice = async () => {
    try {
      setUpdatingPrice(true);
      const res = await fetch("/price", { method: "PUT" });
      if (!res.ok) {
        throw new Error("刷新價格失敗");
      }

      setSubmitStatus({ type: "success", message: "價格已更新" });
      await fetchPortfolio();
    } catch (error) {
      setSubmitStatus({ type: "error", message: error.message || "刷新價格失敗" });
    } finally {
      setUpdatingPrice(false);
    }
  };

  return (
    <div className="app-shell">
      <main className="app-container">
        <section className="app-header-card">
          <h1>PortfolioLens</h1>
          <p>快速紀錄資產交易，建立你的投資組合成本基礎。</p>
          <p>支援台股、美股以及加密貨幣，資產將由美金計價。</p>
        </section>

        {submitStatus.message && (
          <div className={`status-banner ${submitStatus.type}`}>{submitStatus.message}</div>
        )}

        <section className="content-grid">
          <PortfolioForm onSubmit={handleSubmit} />
          <PortfolioChart
            assets={assets}
            loading={loadingAssets}
            onRefreshPrice={handleRefreshPrice}
            updatingPrice={updatingPrice}
          />
        </section>
      </main>
    </div>
  );
}

export default App;