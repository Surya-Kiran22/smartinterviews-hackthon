export const formatPrice = (price) => {
  return `₹${price.toFixed(2)}`
}

export const formatPriceCompact = (price) => {
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)}L`
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(2)}K`
  }
  return `₹${price.toFixed(0)}`
}
