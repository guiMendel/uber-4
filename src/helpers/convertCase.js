// Converts camelCase to separate case
export default function convertCase(text) {
  const splitText = text.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return splitText.charAt(0).toUpperCase() + splitText.slice(1)
}
