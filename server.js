const express = require('express')
var app = express()
const port = process.env.PORT || 4000

var history = require('connect-history-api-fallback')

const staticFileMiddleware = express.static('dist')

// 1st call for unredirected requests
app.use(staticFileMiddleware)

// Support history api
app.use(history({
  index: '/dist/index.html'
}))

// 2nd call for redirected requests
app.use(staticFileMiddleware)

// Listen on port
const server = app.listen(`${port}`, function () {
  console.log(`Server started on port ${port}`)
})

const io = require('socket.io')(server)
const color = require('./color.js')
const gridFn = require('./grid.js')

const interval = 2000
const rows = gridFn.rows
const columns = gridFn.columns

var tick = 0
var users = []
var grid = gridFn.makeGrid(rows, columns)

//Main Function for updating the grid and tick
setInterval(function () {
  [tick, grid] = gridFn.gridUpdate(tick, grid, rows, columns)

  io.emit('update_grid', grid)
  io.emit('update_tick', tick)
}, interval)

io.on('connection', (socket) => {
  // Fired when a socket connects to the server
  users.push({ id: socket.id, color: color.getRandomColor() })

  io.emit('create_users', users)
  socket.emit('create_grid', grid, rows, columns)

  socket.broadcast.emit('new_user')

  console.log('a user has connected', socket.id)

  // Fired when a socket disconnects the server
  socket.on('disconnect', () => {
    users.splice(users.findIndex(x => x.id === socket.id), 1)
    io.emit('create_users', users)

    socket.broadcast.emit('lost_user')

    console.log('user ', socket.id, ' has disconnected')
  })

  // Fired when the client sends an 'update_grid' event which is usually for presets
  socket.on('update_grid', (newGrid) => {
    grid = newGrid
    io.emit('update_grid', grid)
  })

  // Fired when the client sends an 'update_cell' event which is usually on mouse clicks
  socket.on('update_cell', (cell) => {
    grid.splice(cell.value, 1, cell)
    io.emit('update_cell', grid)
  })
})
