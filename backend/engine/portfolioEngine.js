const {find_real_price} = require("./find_real_price");

async function processTransaction(transaction,result) {
  console.log(transaction)
    for (const t of transaction) {
      if (!result[t.asset]) {
        result[t.asset] = { assetType: t.assetType, quantity: 0, totalCost: 0 , averagePrice : 0, real_price : null};
      }

      if (t.assetType) {
        result[t.asset].assetType = t.assetType;
      }

      if (t.type === "BUY") {
        result[t.asset].quantity += t.quantity 
        console.log(result[t.asset].totalCost)
        result[t.asset].totalCost += t.quantity * t.price
        console.log(result[t.asset].totalCost)
        console.log("test",t.quantity * t.price);
        console.log(result[t.asset].totalCost)
      }    

      if (t.type === "SELL") {
        if (t.quantity > result[t.asset].quantity){
          throw new Error("資產不夠")
        }
        result[t.asset].totalCost -= t.quantity * t.price   
        if(t.quantity === result[t.asset].quantity){
          result[t.asset].totalCost = 0;
        }
        result[t.asset].quantity -= t.quantity
      }

      if (result[t.asset].quantity > 0) {
        result[t.asset].averagePrice = result[t.asset].totalCost / result[t.asset].quantity
      }
      else {
        result[t.asset].averagePrice = 0
      }
      result[t.asset].real_price = await find_real_price(t.asset, t.assetType, t.price);
      console.log(result[t.asset].real_price);
    }
  return result      
}

module.exports = {processTransaction};