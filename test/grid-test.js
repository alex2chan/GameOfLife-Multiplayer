const assert = require('chai').assert
const gridFn = require('../grid.js')

/* A simple grid with the following structure by index:
[0, 1, 2]
[3, 4, 5]
[6, 7, 8]
*/

const rows = 3
const columns = 3

describe('Grid', function() {
  var grid = gridFn.makeGrid(rows, columns)

  describe('Constructing a grid with ' + rows + ' rows and ' + columns + ' columns', function() {
    it('Constructing a grid returns an array of length rows * columns', function() {
      assert.typeOf(grid, 'array')
      assert.lengthOf(grid, rows * columns)
    })

    it('The grid array should contain objects which should equal to {value: grid.indexOf(object), checked: false, background: "white"}', function() {
      assert.ownInclude(grid[0], {value: 0, checked: false, background: 'white'})
      assert.ownInclude(grid[grid.length - 1], {value: grid.length - 1, checked: false, background: 'white'})
    })
  })

  describe('Finding all neighbours (alive or dead) of a cell', function() {
    before(function() {
       for (let element of grid) {
         grid.splice(element.value, 1, {value: element.value, checked: true, background: element.background})
       }
    })

    let tests = [
      {cell: 0, neighbours: [1, 3, 4]},
      {cell: 1, neighbours: [0, 3, 4, 5, 2]},
      {cell: 2, neighbours: [1, 4, 5]},
      {cell: 3, neighbours: [0, 1, 4, 7, 6]},
      {cell: 4, neighbours: [0, 1, 2, 3, 5, 6, 7, 8]},
      {cell: 5, neighbours: [2, 1, 4, 7, 8]},
      {cell: 6, neighbours: [3, 4, 7]},
      {cell: 7, neighbours: [6, 3, 4, 5, 8]},
      {cell: 8, neighbours: [5, 4, 7]}
    ]

    for (let test of tests) {
      it('Cell index of ' + test.cell + ' should have neighbours which are ' + test.neighbours, function() {
        assert.sameMembers(gridFn.neighbours(test.cell, grid, rows, columns), test.neighbours)
      })
    }

    after(function() {
      for (let element of grid) {
        grid.splice(element.value, 1, {value: element.value, checked: false, background: element.background})
      }
    })
  })

  describe('Finding all neighbours (alive only) of a cell. The alive cells are the indices [1, 3, 5, 7]', function() {
    // Set it such that the indices 1, 3, 5 and 7 are dead and the rest are alive
    before(function() {
      let dead = [1, 3, 5, 7]
      for (element of grid) {
        if (!dead.includes(element.value)) {
          grid.splice(element.value, 1, {value: element.value, checked: true, background: element.background})
        }
      }
    })

    let tests = [
      {cell: 0, neighbours: [4]},
      {cell: 1, neighbours: [0, 4, 2]},
      {cell: 2, neighbours: [4]},
      {cell: 3, neighbours: [0, 4, 6]},
      {cell: 4, neighbours: [0, 2, 6, 8]},
      {cell: 5, neighbours: [2, 4, 8]},
      {cell: 6, neighbours: [4]},
      {cell: 7, neighbours: [6, 4, 8]},
      {cell: 8, neighbours: [4]}
    ]

    for (let test of tests) {
      it('Cell index of ' + test.cell + ' should have live neighbours which are ' + test.neighbours, function() {
        assert.sameMembers(gridFn.neighbours(test.cell, grid, rows, columns), test.neighbours)
      })
    }

    after(function() {
      for (element of grid) {
        grid.splice(element.value, 1, {value: element.value, checked: false, background: element.background})
      }
    })
  })

  describe('Updating the grid by 1 generation', function() {
    var tick = 0
    // Set it such that only the indices 3, 4 and 5 are alive with different colors
    beforeEach(function() {
      let alive = [
        {value: 3, checked: true, background: '#00bfff'},
        {value: 4, checked: true, background: '#ff0096'},
        {value: 5, checked: true, background: '#99ff66'}
      ]
      for (let cell of alive) {
        grid.splice(cell.value, 1, cell)
      }
    })

    afterEach(function() {
      for (element of grid) {
        grid.splice(element.value, 1, {value: element.value, checked: false, background: element.background})
      }
    })

    describe('Any live cell with fewer than two live neighbors dies, as if caused by under-population', function() {
      it('Initial cells that are alive are [3, 4, 5]. Therefore the cells that will die under this rule are 3 and 5', function() {
        let dead = [3, 5]
        let a = gridFn.gridUpdate(tick, grid, rows, columns)

        let recentlyDeadCells = a[1].filter(x => dead.includes(x.value))

        assert.strictEqual(a[0], 1)
        assert.sameDeepMembers(recentlyDeadCells, [{value: 3, checked: false, background: 'white'}, {value: 5, checked: false, background: 'white'}])
      })
    })

    describe('Any live cell with two or three live neighbors lives on to the next generation', function() {
      it('Initial cells that are alive are [3, 4, 5]. Therefore the cell that will live on under this rule is 4', function() {
        let alive = [4]
        let a = gridFn.gridUpdate(tick, grid, rows, columns)

        let survivorCells = a[1].filter(x => alive.includes(x.value))

        assert.strictEqual(a[0], 1)
        assert.sameDeepMembers(survivorCells, [{value: 4, checked: true, background: '#ff0096'}])
      })
    })

    describe('Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction. When a dead cell revives it will be given a color that is the average of its neighbours', function blinker() {
      it('Initial cells that are alive are [3, 4, 5]. Therefore the cells that will be reborn under this rule are 1 and 7 with average colors of #8895a9', function() {
        let reborn = [1, 7]
        let a = gridFn.gridUpdate(tick, grid, rows, columns)

        let rebornCells = a[1].filter(x => reborn.includes(x.value))

        assert.strictEqual(a[0], 1)
        assert.sameDeepMembers(rebornCells, [{value: 1, checked: true, background: '#8895a9'}, {value: 7, checked: true, background: '#8895a9'}])
      })
    })

    describe('Any live cell with more than three live neighbors dies, as if by overcrowding', function() {
      before(function() {
        // Set 1, 3, 4, 5, 7 as alive
        let alive = [
          {value: 1, checked: true, background: '#00bfff'},
          {value: 3, checked: true, background: '#00bfff'},
          {value: 4, checked: true, background: '#ff0096'},
          {value: 5, checked: true, background: '#99ff66'},
          {value: 7, checked: true, background: '#99ff66'}
        ]
        for (let cell of alive) {
          grid.splice(cell.value, 1, cell)
        }
      })

      it('Initial cells that are alive are [1, 3, 4, 5, 7]. Therefore the cell that will die under this rule is 4', function() {
        let dead = [4]
        let a = gridFn.gridUpdate(tick, grid, rows, columns)

        let deadCells = a[1].filter(x => dead.includes(x.value))

        assert.strictEqual(a[0], 1)
        assert.sameDeepMembers(deadCells, [{value: 4, checked: false, background: 'white'}])
      })
    })
  })
})
