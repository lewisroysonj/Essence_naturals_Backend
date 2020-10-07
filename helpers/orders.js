/** @format */

module.exports = {
  calculatePrice: function calculatePrice(products) {
    let prices = [];
    for (let i = 0; i < products.length; i++) {
      prices.push(Number(products[i].finalPrice));
    }

    let totalPrice = 0;
    for (let i in prices) {
      totalPrice += prices[i];
    }
    return totalPrice;
  },

  groupBy: function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);

      return result;
    }, {});
  },

  handleGroupedArray: function handleGroupedArray(groupedProducts) {
    const cartproductArray = [];
    let cartQuantity = [];

    let o = Object.keys(groupedProducts);

    for (let i = 0; i < o.length; i++) {
      groupedProducts[o[i]][0].qty = groupedProducts[o[i]].length;
      cartproductArray.push(groupedProducts[o[i]][0]);
      cartQuantity.push(groupedProducts[o[i]][0].qty);
    }
    let totalQuantity = 0;
    for (let i in cartQuantity) {
      totalQuantity += cartQuantity[i];
    }
    return {
      cartproductArray,
      totalQuantity,
    };
  },
};
