/**
 * Validates extracted price and stock data.
 * Throws errors if values are missing, NaN, negative, or invalid.
 */
function validateScrapeData(data, selectedOption) {
  if (!data) {
    throw new Error(`No data extracted for option "${selectedOption}"`);
  }

  const { price, stock } = data;

  if (price === undefined || price === null || isNaN(price)) {
    throw new Error(`Invalid price value extracted: ${price}`);
  }

  if (typeof price !== 'number' || price < 0) {
    throw new Error(`Price must be a non-negative number. Got: ${price}`);
  }

  if (stock !== undefined && stock !== null) {
    if (isNaN(stock) || stock < 0) {
      throw new Error(`Invalid stock value extracted: ${stock}`);
    }
  }

  return true;
}

module.exports = { validateScrapeData };
