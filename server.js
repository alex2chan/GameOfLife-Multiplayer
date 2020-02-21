const express = require('express')
var app = express()
const port = process.env.PORT || 4000

var history = require('connect-history-api-fallback')

const staticFileMiddleware = express.static('dist');

// 1st call for unredirected requests
app.use(staticFileMiddleware);

// Support history api
app.use(history({
  index: '/dist/index.html'
}));

// 2nd call for redirected requests
app.use(staticFileMiddleware);

const server = app.listen(`${port}`, function () {
  console.log(`Server started on port ${port}`)
})

const io = require('socket.io')(server)

const rows = 18
const columns = 21
var tick = 0
var users = []
var grid = makeGrid(rows, columns)

function makeGrid (rows, columns) {
  var a = Array.from(Array(rows * columns).keys())
  var grid = a.map(function (x) { return { value: x, checked: false, background: 'white' } })

  return grid
}

function hexToRGB (h) {
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

function rgbToHex (r, g, b) {
  r = r.toString(16)
  g = g.toString(16)
  b = b.toString(16)

  if (r.length === 1) { r = '0' + r }
  if (g.length === 1) { g = '0' + g }
  if (b.length === 1) { b = '0' + b }

  return '#' + r + g + b
}

function neighbours (x) {
  var up = x - columns
  var down = (x + columns) < (rows * columns) ? x + columns : -1
  var left = (x % columns) !== 0 ? x - 1 : -1
  var right = ((x + 1) % columns) !== 0 ? x + 1 : -1
  var topLeft = ((x - columns) !== 0) && (((x - columns) % columns) !== 0) ? x - columns - 1 : -1
  var topRight = ((x - columns) !== 0) && (((x - columns + 1) % columns) !== 0) ? x - columns + 1 : -1
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

function gridUpdate () {
  tick += 1

  var changes = []

  for (var cell of grid) {
    var n = neighbours(cell.value)
    if (cell.checked && n.length < 2) {
      changes.push({ value: cell.value, checked: false, background: 'white' })
    }
    if ((cell.checked && n.length === 2) || (n.length === 3)) {
      changes.push({ value: cell.value, checked: true, background: cell.background })
    }
    if (cell.checked && n.length > 3) {
      changes.push({ value: cell.value, checked: false, background: 'white' })
    }
    if (!cell.checked && n.length === 3) {
      var nBackgroundArray = []

      for (var i of n) {
        if (grid[i].background !== 'white') {
          var rgb = hexToRGB(grid[i].background)
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

      var avgHex = rgbToHex(avgRGB.r, avgRGB.g, avgRGB.b)

      changes.push({ value: cell.value, checked: true, background: avgHex })
    }
  }

  for (var c of changes) {
    grid.splice(c.value, 1, c)
  }

  return grid
}

function getRandomColor () {
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

setInterval(function () {
  gridUpdate()
}, 2000)

io.on('connection', (socket) => {
  users.push({ id: socket.id, color: getRandomColor() })
  io.emit('create_users', users)
  io.emit('create_grid', grid, rows, columns)

  setInterval(function () {
    io.emit('update_grid', grid)
    io.emit('update_tick', tick)
  }, 2000)

  console.log('a user has connected', socket.id)

  socket.on('disconnect', () => {
    users.splice(users.findIndex(x => x.id === socket.id), 1)
    io.emit('create_users', users)

    socket.broadcast.emit('lost_user')

    console.log('user ', socket.id, ' has disconnected')
  })

  socket.broadcast.emit('new_user')

  // socket.on('update_tick', (newTick) => {
  //   tick = newTick
  //   io.emit('update_tick', tick)
  // })

  socket.on('update_grid', (newGrid) => {
    grid = newGrid
    io.emit('update_grid', grid)
  })

  socket.on('update_cell', (cell) => {
    grid.splice(cell.value, 1, cell)
    io.emit('update_cell', grid)
  })
})
