/** @format */

function createOptions(array, selector, element) {
  const options = array.map((category) => {
    const categorySelector = document.getElementById(selector);
    const option = document.createElement(element);
    option.innerHTML = category.name;
    categorySelector.appendChild(option);
  });
}

module.exports = {
  createOptions,
};
