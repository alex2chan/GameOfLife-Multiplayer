// Gets a random color in HEX
const getRandomColor = function getRandomColor () {
  var letters = '0123456789ABCDEF'.split('')
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 15)]
  }

  if (color === '#FFFFFF') {
    this.getRandomColor()
  } else {
    return color
  }
}

// Converts HEX to RGB
const hexToRGB = function hexToRGB (h) {
  let r = 0; let g = 0; let b = 0

  // 3 digits
  if (h.length === 4) {
    r = '0x' + h[1] + h[1]
    g = '0x' + h[2] + h[2]
    b = '0x' + h[3] + h[3]
  // 6 digits
  } else if (h.length === 7) {
    r = '0x' + h[1] + h[2]
    g = '0x' + h[3] + h[4]
    b = '0x' + h[5] + h[6]
  }

  return { r: parseInt(r), g: parseInt(g), b: parseInt(b) }
}

// Converts RGB to HEX
const rgbToHex = function rgbToHex (r, g, b) {
  r = r.toString(16)
  g = g.toString(16)
  b = b.toString(16)

  if (r.length === 1) { r = '0' + r }
  if (g.length === 1) { g = '0' + g }
  if (b.length === 1) { b = '0' + b }

  return '#' + r + g + b
}

exports.getRandomColor = getRandomColor
exports.hexToRGB = hexToRGB
exports.rgbToHex = rgbToHex
