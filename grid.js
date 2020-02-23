const color = require('./color.js')
const rows = 18
const columns = 21

// Makes a boundede grid from the rows and columns, each cell has an index starting from 0 and continues from the right
const makeGrid = function makeGrid (rows, columns) {
  var a = Array.from(Array(rows * columns).keys())
  var grid = a.map(function (x) { return { value: x, checked: false, background: 'white' } })

  return grid
}

// Find the 8 neighbours surrounding a cell
const neighbours = function neighbours (x, grid, rows, columns) {
  var up = x - columns
  var down = (x + columns) < (rows * columns) ? x + columns : -1
  var left = (x % columns) !== 0 ? x - 1 : -1
  var right = ((x + 1) % columns) !== 0 ? x + 1 : -1
  var topLeft = ((x - columns) !== 0) && (((x - columns) % columns) !== 0) ? x - columns - 1 : -1
  var topRight = ((x - columns) !== columns - 1) && (((x - columns + 1) % columns) !== 0) ? x - columns + 1 : -1
  var bottomLeft = (x + columns) % columns !== 0 && (x + columns) < (rows * columns) ? x + columns - 1 : -1
  var bottomRight = (x + columns + 1) % columns !== 0 && (x + columns) < (rows * columns) ? x + columns + 1 : -1
  var potentialNeighbours = [topLeft, up, topRight, left, right, bottomLeft, down, bottomRight].filter(x => x >= 0)

  var neighbours = []
  for (var n of potentialNeighbours) {
    if (grid[n].checked) {
      neighbours.push(n)
    }
  }

  return neighbours
}

// Main function for updating the grid and tick
const gridUpdate = function gridUpdate (tick, grid, rows, columns) {
  tick += 1

  var changes = []

  for (var cell of grid) {
    var n = neighbours(cell.value, grid, rows, columns)

    // Any live cell with fewer than two live neighbors dies, as if caused by under-population
    if (cell.checked && n.length < 2) {
      changes.push({ value: cell.value, checked: false, background: 'white' })
    }

    // Any live cell with two or three live neighbors lives on to the next generation
    if ((cell.checked && n.length === 2) || (n.length === 3)) {
      changes.push({ value: cell.value, checked: true, background: cell.background })
    }

    // Any live cell with more than three live neighbors dies, as if by overcrowding
    if (cell.checked && n.length > 3) {
      changes.push({ value: cell.value, checked: false, background: 'white' })
    }

    // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction
    // When a dead cell revives it will be given a color that is the average of its neighbours
    if (!cell.checked && n.length === 3) {
      var nBackgroundArray = []

      for (var i of n) {
        if (grid[i].background !== 'white') {
          var rgb = color.hexToRGB(grid[i].background)
          nBackgroundArray.push(rgb)
        }
      }

      var totalRGB = nBackgroundArray.reduce((acc, cV) => {
        var r = acc.r + cV.r
        var g = acc.g + cV.g
        var b = acc.b + cV.b
        return { r: r, g: g, b: b }
      })

      var avgRGB = { r: Math.round(totalRGB.r / nBackgroundArray.length), g: Math.round(totalRGB.g / nBackgroundArray.length), b: Math.round(totalRGB.b / nBackgroundArray.length) }

      var avgHex = color.rgbToHex(avgRGB.r, avgRGB.g, avgRGB.b)

      changes.push({ value: cell.value, checked: true, background: avgHex })
    }
  }

  // Applying changes
  for (var c of changes) {
    grid.splice(c.value, 1, c)
  }

  return [tick, grid]
}

exports.makeGrid = makeGrid
exports.neighbours = neighbours
exports.gridUpdate = gridUpdate
exports.rows = rows
exports.columns = columns
