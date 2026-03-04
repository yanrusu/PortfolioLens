const YahooFinance = require("yahoo-finance2").default;

const isAlpha = (word) => {
    if (word.charCodeAt(0) >= 65 && word.charCodeAt(0)<=90) return true;
}

const yahooFinance = new YahooFinance();
const find_real_price = async (asset, asset_type, nprice) => {
    if(asset_type === "STOCK" || asset_type === "BOND"){
        if (isAlpha(asset)){
            const quote = await yahooFinance.quote(asset);
            const price = await quote.postMarketPrice || quote.bid || quote.regularMarketPrice || nprice;
            return Math.round(price * 100) / 100;
        }
        const quote = await yahooFinance.quote(`${asset}.TW`);
        const price = quote.postMarketPrice/31 || quote.bid/31 || nprice;
        return Math.round(price * 100) / 100;
    }
    else if(asset_type === "CRYPTO"){
        const quote = await yahooFinance.quote(`${asset}-USD`);
        const price = quote.regularMarketPrice || nprice;
        return Math.round(price * 100) / 100;
    }
    else{
        return 1;
    }
}

module.exports = {find_real_price};