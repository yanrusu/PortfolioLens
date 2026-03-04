import { useState } from "react";

const CHART_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#f97316",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatCurrencyOrDash = (value) =>
  Number.isFinite(Number(value)) ? formatCurrency(value) : "-";

const formatPercent = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

const buildDonutGradient = (assets, totalCost) => {
  if (!totalCost || assets.length === 0) {
    return "conic-gradient(#e2e8f0 0% 100%)";
  }

  let current = 0;
  const segments = assets.map((item) => {
    const ratio = (item.totalCost / totalCost) * 100;
    const start = current;
    const end = current + ratio;
    current = end;
    return `${item.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
};

export default function PortfolioChart({ assets, loading, onRefreshPrice, updatingPrice = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartMode, setChartMode] = useState("asset");
  const chartModeSequence = ["asset", "type", "stock", "crypto"];
  const chartModeLabelMap = {
    asset: "個別資產",
    type: "資產種類",
    stock: "股票/債券分類",
    crypto: "加密貨幣分類",
  };

  const switchChartMode = () => {
    const currentIndex = chartModeSequence.indexOf(chartMode);
    const nextIndex = (currentIndex + 1) % chartModeSequence.length;
    setChartMode(chartModeSequence[nextIndex]);
  };

  const normalizedAssets = (assets || []).map((item) => {
    const totalCost = Number(item.total_cost ?? item.totalCost ?? 0);
    const rawRealPrice = item.real_price ?? item.realPrice;
    const parsedRealPrice = Number(rawRealPrice);
    const assetType = item.asset_type ?? item.assetType ?? "STOCK";
    const realPrice = Number.isFinite(parsedRealPrice)
      ? parsedRealPrice
      : assetType === "CASH"
        ? 1
        : null;
    const quantity = Number(item.quantity || 0);
    return {
      key: item.asset,
      asset: item.asset,
      assetType,
      quantity,
      avgCost: Number(item.avg_cost ?? item.averagePrice ?? 0),
      totalCost,
      realPrice,
      currentValue: Number.isFinite(realPrice) ? quantity * realPrice : null,
      color: CHART_COLORS[0],
    };
  });

  const visibleAssets = normalizedAssets
    .filter((item) => item.quantity > 0)
    .map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  const totalPortfolioCost = visibleAssets.reduce((sum, item) => sum + item.totalCost, 0);
  const totalCurrentValue = visibleAssets.reduce(
    (sum, item) => sum + (Number.isFinite(item.currentValue) ? item.currentValue : 0),
    0
  );
  const totalProfitLoss = totalCurrentValue - totalPortfolioCost;
  const totalProfitLossRate = totalPortfolioCost > 0 ? (totalProfitLoss / totalPortfolioCost) * 100 : 0;
  const assetsWithRatio = visibleAssets.map((item) => ({
    ...item,
    ratio: totalPortfolioCost > 0 ? (item.totalCost / totalPortfolioCost) * 100 : 0,
  }));

  const typeAggregateMap = visibleAssets.reduce((acc, item) => {
    const key = item.assetType;
    if (!acc[key]) {
      acc[key] = {
        key: `type-${key}`,
        asset: key,
        assetType: key,
        totalCost: 0,
        currentValue: 0,
        quantity: 0,
        assetCount: 0,
      };
    }

    acc[key].totalCost += item.totalCost;
    acc[key].currentValue += Number.isFinite(item.currentValue) ? item.currentValue : 0;
    acc[key].quantity += item.quantity;
    acc[key].assetCount += 1;
    return acc;
  }, {});

  const typeWithRatio = Object.values(typeAggregateMap).map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    ratio: totalPortfolioCost > 0 ? (item.totalCost / totalPortfolioCost) * 100 : 0,
  }));

  const sortedAssetsForExpanded = [...assetsWithRatio].sort((a, b) => b.ratio - a.ratio);
  const sortedTypesForExpanded = [...typeWithRatio].sort((a, b) => b.ratio - a.ratio);
  const stockAssets = visibleAssets.filter(
    (item) => item.assetType === "STOCK" || item.assetType === "BOND"
  );
  const stockTotalCost = stockAssets.reduce((sum, item) => sum + item.totalCost, 0);
  const stocksWithRatio = stockAssets.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    ratio: stockTotalCost > 0 ? (item.totalCost / stockTotalCost) * 100 : 0,
  }));
  const sortedStocksForExpanded = [...stocksWithRatio].sort((a, b) => b.ratio - a.ratio);

  const cryptoAssets = visibleAssets.filter((item) => item.assetType === "CRYPTO");
  const cryptoTotalCost = cryptoAssets.reduce((sum, item) => sum + item.totalCost, 0);
  const cryptosWithRatio = cryptoAssets.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    ratio: cryptoTotalCost > 0 ? (item.totalCost / cryptoTotalCost) * 100 : 0,
  }));
  const sortedCryptosForExpanded = [...cryptosWithRatio].sort((a, b) => b.ratio - a.ratio);

  const chartItems =
    chartMode === "asset"
      ? assetsWithRatio
      : chartMode === "type"
        ? typeWithRatio
        : chartMode === "stock"
          ? stocksWithRatio
          : cryptosWithRatio;
  const expandedItems =
    chartMode === "asset"
      ? sortedAssetsForExpanded
      : chartMode === "type"
        ? sortedTypesForExpanded
        : chartMode === "stock"
          ? sortedStocksForExpanded
          : sortedCryptosForExpanded;
  const donutBaseTotal =
    chartMode === "stock"
      ? stockTotalCost
      : chartMode === "crypto"
        ? cryptoTotalCost
        : totalPortfolioCost;
  const donutGradient = buildDonutGradient(chartItems, donutBaseTotal);

  if (loading) {
    return (
      <section className="chart-card">
        <h2>資產分佈</h2>
        <p className="chart-empty">載入中...</p>
      </section>
    );
  }

  if (visibleAssets.length === 0) {
    return (
      <section className="chart-card">
        <h2>資產分佈</h2>
        <p className="chart-empty">目前沒有資產資料，先新增一筆交易吧。</p>
      </section>
    );
  }

  return (
    <section className={`chart-card ${!isExpanded ? "chart-collapsed" : ""}`}>
      <div className="chart-header">
        <h2>資產分佈</h2>
        <div className="chart-summary">
          <span>
            總成本：{formatCurrency(totalPortfolioCost)} ｜ 總現值：{formatCurrency(totalCurrentValue)}
          </span>
          <span className={totalProfitLoss < 0 ? "negative-text" : ""}>
            總損益：{formatCurrency(totalProfitLoss)} ｜ 損益率：{formatPercent(totalProfitLossRate)}
          </span>
        </div>
      </div>

      <div className="donut-wrap">
        <div className="donut-chart" style={{ background: donutGradient }}>
          <div className="donut-hole">
            <strong>
              {chartMode === "asset"
                ? visibleAssets.length
                : chartMode === "type"
                  ? typeWithRatio.length
                  : chartMode === "stock"
                    ? stocksWithRatio.length
                    : cryptosWithRatio.length}
            </strong>
            <span>
              {chartMode === "asset"
                ? "檔資產"
                : chartMode === "type"
                  ? "種類"
                  : chartMode === "stock"
                    ? "檔股票/債券"
                    : "檔加密貨幣"}
            </span>
          </div>
        </div>
      </div>

      <div className="chart-footer-actions">
        <p className="collapsed-hint">
          {isExpanded ? "已展開全部明細。" : "已收合明細，點擊「展開資產」查看。"}
        </p>
        <div className="chart-action-buttons">
          <button
            type="button"
            className="refresh-price-btn refresh-price-btn-inline"
            onClick={onRefreshPrice}
            disabled={updatingPrice}
          >
            {updatingPrice ? "刷新中..." : "刷新價格"}
          </button>
          <button
            type="button"
            className="mode-toggle-btn active"
            onClick={switchChartMode}
          >
            切換圖表：{chartModeLabelMap[chartMode]}
          </button>
          <button
            type="button"
            className="collapse-all-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? "收合資產" : "展開資產"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="chart-legend">
            {expandedItems.map((item) => (
              <div key={`legend-${item.key}`} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                <span className="legend-name">{item.asset}</span>
                <span className="legend-ratio">{item.ratio.toFixed(1)}%</span>
              </div>
            ))}
          </div>

          <div className="chart-bars">
            {expandedItems.map((item) => {
              return (
                <div key={item.key} className="chart-row">
                  <div className="row-top">
                    <div className="asset-meta">
                      <strong>{item.asset}</strong>
                      <span>
                        {chartMode === "type"
                          ? `${item.assetCount} 檔資產`
                          : item.assetType}
                      </span>
                    </div>
                    <div className="asset-values">
                      <strong>{formatCurrencyOrDash(item.currentValue)}</strong>
                      <span>{item.ratio.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max(item.ratio, 3)}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <div className="row-bottom">
                    <div className="row-bottom-left">
                      {item.assetType !== "CASH" && (
                        <span>{chartMode === "type" ? `總數量：${item.quantity}` : `數量：${item.quantity}`}</span>
                      )}
                      {chartMode !== "type" && item.assetType !== "CASH" && (
                        <span>現價：{formatCurrencyOrDash(item.realPrice)}</span>
                      )}
                    </div>
                    <div className="row-bottom-right">
                      {chartMode !== "type" && item.assetType !== "CASH" && (
                        <span>均價：{formatCurrency(item.avgCost)}</span>
                      )}
                      {item.assetType !== "CASH" && <span>成本：{formatCurrency(item.totalCost)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
