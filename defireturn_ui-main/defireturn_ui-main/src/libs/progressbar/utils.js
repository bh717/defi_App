export const calculateSafeValue = ({ min, max, propValue }) => {
  if (propValue >= max) {
    return max
  }
  if (propValue <= min) {
    return min
  }
  if (propValue >= min || propValue <= max) {
    return propValue
  }
}
